/**
 * Tests for the domain marketplace contract
 */

require('mocha')
const {expect} = require('chai')
const {newUser, fetchJson, getTestType, callFioApi} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/fiosdk');
const config = require('../config.js');
const testType = getTestType();

// This creates an sdk object for the fio.devtools faucet for funding other accounts.
before(async () => {
  faucet = new FIOSDK(config.FAUCET_PRIV_KEY, config.FAUCET_PUB_KEY, config.BASE_URL, fetchJson);
})

describe('************************** domain-marketplace.js ************************** \n    A. Template test for domain marketplace', () => {

    let user1

    it(`Create users`, async () => {
        user1 = await newUser(faucet);  //Uses utils.js to create a funded account with a registered address and domain
    })

    it.skip(`Show user info`, async () => {
        console.log('user1.account: ', user1.account);
        console.log('user1.publicKey: ', user1.publicKey);
        console.log('user1.privateKey: ', user1.privateKey);
        console.log('user1.domain: ', user1.domain);
        console.log('user1.address: ', user1.address);
    })

    it(`Get balance for user1`, async () => {
        try {
            const result = await user1.sdk.genericAction('getFioBalance', {
                fioPublicKey: user1.publicKey
            })
            console.log('Result', result)
        } catch (err) {
            //console.log('Error', err)
            expect(err).to.equal(null)
        }
    })

    it(`Call get_table_rows from fionames for user1.account and confirm: lock_amount - remaining_lock_amount = 0`, async () => {
        try {
            const json = {
                json: true,
                code: 'fio.address',
                scope: 'fio.address',
                table: 'fionames',
                lower_bound: user1.account,
                upper_bound: user1.account,
                key_type: 'i64',
                index_position: '4'
            }
            result = await callFioApi("get_table_rows", json);
            //console.log('Result: ', result);
            expect(result.rows[0].name).to.equal(user1.address);
        } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
        }
    })

    it(`(pushtransaction) Transfer FIO from user1 to another FIO Public Key`, async () => {
        try {
            const result = await user1.sdk.genericAction('pushTransaction', {
                action: 'trnsfiopubky',
                account: 'fio.token',
                data: {
                    payee_public_key: 'FIO8NYhQYKza2qtHMp2ceitjar6yRbkB4muLTUbS23piU4Dn7V61r',
                    amount: 10000000000,
                    max_fee: config.maxFee,
                    tpid: ''
                }
            })
            //console.log('Result: ', result);
            expect(result.status).to.equal('OK');
        } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
        }
    })

})

describe('B. Error testing template', () => {
    let user1

    it(`Create users`, async () => {
        user1 = await newUser(faucet);  //Uses utils.js to create a funded account with a registered address and domain
    })

    it.skip(`Show user info`, async () => {
        console.log('user1.account: ', user1.account);
        console.log('user1.publicKey: ', user1.publicKey);
        console.log('user1.privateKey: ', user1.privateKey);
        console.log('user1.domain: ', user1.domain);
        console.log('user1.address: ', user1.address);
    })

    it(`(pushtransaction) Run trnsfiopubky with invalid FIO Public Key. Expect error code 400: ${config.error.invalidKey}`, async () => {
        try {
            const result = await user1.sdk.genericAction('pushTransaction', {
                action: 'trnsfiopubky',
                account: 'fio.token',
                data: {
                    payee_public_key: 'BadPublicKey',
                    amount: 10000000000,
                    max_fee: config.maxFee,
                    tpid: ''
                }
            })
            console.log('Result: ', result);
            expect(result.status).to.equal(null);
        } catch (err) {
            //console.log('Error: ', err.json.fields);
            expect(err.json.fields[0].error).to.equal(config.error.invalidKey)
            expect(err.errorCode).to.equal(400);
        }
    })

    it(`Attempt trnsfiopubky with invalid fee format. Expect error type 400: Invalid fee value.`, async () => {
        try {
            const result = await user1.sdk.genericAction('pushTransaction', {
                action: 'trnsfiopubky',
                account: 'fio.token',
                data: {
                    payee_public_key: 'FIO8NYhQYKza2qtHMp2ceitjar6yRbkB4muLTUbS23piU4Dn7V61r',
                    amount: 10000000000,
                    max_fee: -1232,
                    tpid: ''
                }
            })
            console.log('Result: ', result);
            expect(result.status).to.equal(null);
        } catch (err) {
            //console.log('Error: ', err.json);
            expect(err.json.fields[0].error).to.equal('Invalid fee value.')
            expect(err.errorCode).to.equal(400);
        }
    })

    it(`Attempt addbundles with invalid TPID. Expect error type ${config.error2.invalidTpid.statusCode}: ${config.error2.invalidTpid.message}`, async () => {
        try {
            const result = await user1.sdk.genericAction('pushTransaction', {
                action: 'trnsfiopubky',
                account: 'fio.token',
                data: {
                    payee_public_key: 'FIO8NYhQYKza2qtHMp2ceitjar6yRbkB4muLTUbS23piU4Dn7V61r',
                    amount: 10000000000,
                    max_fee: config.maxFee,
                    tpid: '-invalidtpid-'
                }
            })
            console.log('Result: ', result);
            expect(result.status).to.equal(null);
        } catch (err) {
            //console.log('Error: ', err.json);
            expect(err.json.fields[0].error).to.equal(config.error2.invalidTpid.message)
            expect(err.errorCode).to.equal(config.error2.invalidTpid.statusCode);
        }
    })
})

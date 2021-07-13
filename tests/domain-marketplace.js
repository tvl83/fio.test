/**
 * Tests for the domain marketplace contract
 */

require('mocha')
const {expect} = require('chai')
const {newUser, fetchJson, timeout, getTestType, callFioApi} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/fiosdk');
const config = require('../config.js');
config = require('../config.js');
const testType = getTestType();

// This creates an sdk object for the fio.devtools faucet for funding other accounts.
before(async () => {
  faucet = new FIOSDK(config.FAUCET_PRIV_KEY, config.FAUCET_PUB_KEY, config.BASE_URL, fetchJson);
})

describe('************************** domain-marketplace.js ************************** \n    A. Template test for domain marketplace', () => {

    let user1

    it(`Create users`, async () => {
        user1 = await newUser(faucet);  //Uses utils.js to create a funded account with a registered address and domain
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

    it(`Get bundledbvotenumber from bundlevoters table`, async () => {
        try {
            const json = {
                json: true,
                code: 'fio.fee',
                scope: 'fio.fee',
                table: 'bundlevoters',
                limit: 10,
                reverse: false,
                show_payer: false
            }
            result = await callFioApi("get_table_rows", json);
            if (result.rows.length != 0) {
                bundledVoteNumber = result.rows[0].bundledbvotenumber;
            }
            //console.log('bundledVoteNumber: ', bundledVoteNumber);
            expect(bundledVoteNumber).to.greaterThan(0);
        } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
        }
    })

    it(`Call get_table_rows from locktokens and confirm: lock_amount - remaining_lock_amount = 0`, async () => {
        try {
            const json = {
                json: true,
                code: 'eosio',
                scope: 'eosio',
                table: 'locktokens',
                lower_bound: account,
                upper_bound: account,
                key_type: 'i64',
                index_position: '2'
            }
            result = await callFioApi("get_table_rows", json);
            //console.log('Result: ', result);
            expect(result.rows[0].lock_amount - result.rows[0].remaining_lock_amount).to.equal(0);
        } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
        }
    })

    it(`(pushtransaction) Run addbundles with invalid FIO Address format. Expect error type ${config.error2.invalidFioAddress.statusCode}: ${config.error2.invalidFioAddress.message}`, async () => {
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
            console.log('Result: ', result);
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
        console.log('user1.account: ', user1.account);
        console.log('user1.publicKey: ', user1.publicKey);
        console.log('user1.privateKey: ', user1.privateKey);
        console.log('user1.domain: ', user1.domain);
        console.log('user1.address: ', user1.address);
    })

    it('Get add_bundled_transactions_fee', async () => {
        try {
            result = await user1.sdk.getFee('add_bundled_transactions', user1.address);
            add_bundled_transactions_fee = result.fee;
        } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
        }
    })

    it(`(pushtransaction) Run addbundles with invalid FIO Address format. Expect error type ${config.error2.invalidFioAddress.statusCode}: ${config.error2.invalidFioAddress.message}`, async () => {
        try {
            const result = await user1.sdk.genericAction('pushTransaction', {
                action: 'addbundles',
                account: 'fio.address',
                data: {
                    fio_address: '[#invalid@address',
                    bundle_sets: bundleSets,
                    max_fee: add_bundled_transactions_fee,
                    tpid: ''
                }
            })
            console.log('Result: ', result);
            expect(result.status).to.equal(null);
        } catch (err) {
            //console.log('Error: ', err.json.fields);
            expect(err.json.fields[0].error).to.equal(config.error2.invalidFioAddress.message)
            expect(err.errorCode).to.equal(config.error2.invalidFioAddress.statusCode);
        }
    })

    it(`Attempt addbundles with invalid fee format. Expect error type ${config.error2.invalidFeeValue.statusCode}: ${config.error2.invalidFeeValue.message}`, async () => {
        try {
            const result = await user1.sdk.genericAction('pushTransaction', {
                action: 'addbundles',
                account: 'fio.address',
                data: {
                  fio_address: user1.address,
                  bundle_sets: bundleSets,
                  max_fee: -1,
                  tpid: ''
                }
            })
            console.log('Result: ', result);
            expect(result.status).to.equal(null);
        } catch (err) {
            //console.log('Error: ', err);
            expect(err.json.fields[0].error).to.equal(config.error2.invalidFeeValue.message)
            expect(err.errorCode).to.equal(config.error2.invalidFeeValue.statusCode);
        }
    })

    it(`Attempt addbundles with invalid TPID. Expect error type ${config.error2.invalidTpid.statusCode}: ${config.error2.invalidTpid.message}`, async () => {
        try {
            const result = await user1.sdk.genericAction('pushTransaction', {
                action: 'addbundles',
                account: 'fio.address',
                data: {
                  fio_address: user1.address,
                  bundle_sets: bundleSets,
                  max_fee: add_bundled_transactions_fee * bundleSets,
                  tpid: '##invalidtpid##'
                }
            })
            console.log('Result: ', result);
            expect(result.status).to.equal(null);
        } catch (err) {
            //console.log('Error: ', err);
            expect(err.json.fields[0].error).to.equal(config.error2.invalidTpid.message)
            expect(err.errorCode).to.equal(config.error2.invalidTpid.statusCode);
        }
    })
})
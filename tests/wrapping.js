require('mocha')
const {expect} = require('chai')
const {newUser, fetchJson, timeout, getTestType, callFioApi, callFioApiSigned} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/fiosdk')
config = require('../config.js');
const testType = getTestType();

before(async () => {
  faucet = new FIOSDK(config.FAUCET_PRIV_KEY, config.FAUCET_PUB_KEY, config.BASE_URL, fetchJson);
})

describe.only('************************** wrapping.js ************************** \n    A. Wrap FIO. Confirm creation of ETH approve.', () => {

    let user1
    const maxOracleFee = 1000000000,
        amount = 100000000000,  //100 FIO
        chainCode = 'ETH',
        publicAddress = '0x3BDAfc1a2d47e24dA5F9740AEA919F35F8186eA3'

    it(`Create users`, async () => {
        user1 = await newUser(faucet);
    })

    it('Echo oraclelgdrs table', async () => {
        try {
          const json = {
            json: true,
            code: 'fio.oracle', 
            scope: 'fio.oracle', 
            table: 'oraclelgdrs', 
            limit: 10,               
            reverse: false,         
            show_payer: false  
          }
          result = await callFioApi("get_table_rows", json);
          console.log('oraclelgdrs: ', result);
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      })

      it('Echo oracless table', async () => {
        try {
          const json = {
            json: true,
            code: 'fio.oracle', 
            scope: 'fio.oracle', 
            table: 'oracless', 
            limit: 10,               
            reverse: false,         
            show_payer: false  
          }
          result = await callFioApi("get_table_rows", json);
          console.log('oracless: ', result);
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      })

      it('Echo oravotes table', async () => {
        try {
          const json = {
            json: true,
            code: 'fio.oracle', 
            scope: 'fio.oracle', 
            table: 'oravotes', 
            limit: 10,               
            reverse: false,         
            show_payer: false  
          }
          result = await callFioApi("get_table_rows", json);
          console.log('oravotes: ', result);
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      })

    it(`Wrap FIO`, async () => {
        try {
          const result = await callFioApiSigned('push_transaction', {
            action: 'wraptokens',
            account: 'fio.oracle',
            actor: user1.account,
            privKey: user1.privateKey,
            data: {
                amount: 100000000000,
                chain_code: 'ETH',
                public_address: '0x3BDAfc1a2d47e24dA5F9740AEA919F35F8186eA3',
                max_oracle_fee: 100000000000,
                max_fee: 100000000000,
                tpid: 'tpid@fiotestnet',
                actor: user1.account
            }
          })
          console.log('Result: ', result.error)
          //expect(result.processed.receipt.status).to.equal('executed');
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      })

      it('Echo oraclelgdrs table', async () => {
        try {
          const json = {
            json: true,
            code: 'fio.oracle', 
            scope: 'fio.oracle', 
            table: 'oraclelgdrs', 
            limit: 10,               
            reverse: false,         
            show_payer: false  
          }
          result = await callFioApi("get_table_rows", json);
          console.log('oraclelgdrs: ', result);
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      })

      it('Echo oracless table', async () => {
        try {
          const json = {
            json: true,
            code: 'fio.oracle', 
            scope: 'fio.oracle', 
            table: 'oracless', 
            limit: 10,               
            reverse: false,         
            show_payer: false  
          }
          result = await callFioApi("get_table_rows", json);
          console.log('oracless: ', result);
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      })

      it('Echo oravotes table', async () => {
        try {
          const json = {
            json: true,
            code: 'fio.oracle', 
            scope: 'fio.oracle', 
            table: 'oravotes', 
            limit: 10,               
            reverse: false,         
            show_payer: false  
          }
          result = await callFioApi("get_table_rows", json);
          console.log('oravotes: ', result);
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      })

})
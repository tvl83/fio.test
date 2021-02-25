require('mocha')
const {expect} = require('chai')
const {newUser, fetchJson, timeout, getTestType, callFioApi, callFioApiSigned} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/fiosdk')
config = require('../config.js');
const testType = getTestType();
const Eth = require('web3-eth');

const Web3 = require('web3');
let web3 = new Web3(Web3.givenProvider || '');

//var eth = new Eth('');

before(async () => {
  faucet = new FIOSDK(config.FAUCET_PRIV_KEY, config.FAUCET_PUB_KEY, config.BASE_URL, fetchJson);
})

describe.only('************************** wrapping.js ************************** \n    A. Wrap FIO. Confirm creation of ETH approve.', () => {

    let user1
    const maxOracleFee = 1000000000,
        amount = 100000000000,  //100 FIO
        chainCode = 'ETH',
        publicAddress = ''

    it(`Create users`, async () => {
        user1 = await newUser(faucet);
        
    })

    it.only(`eth test`, async () => {
        acct = await web3.eth.getAccounts();
        console.log('acct: ', acct)
        balance = web3.eth.getBalance(publicAddress)
        console.log('balance: ', balance)
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
                public_address: publicAddress,
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
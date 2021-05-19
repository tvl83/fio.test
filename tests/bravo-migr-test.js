/*****
 This test loads up the chain with 1000 Requests and 1000 OBTs and then:
 - Calls migrtx 
 - After the first call, tests that new requests and OBTs are being added to both tables. 
 - Repeatedly calls migrtrx to complete migration.
 - Confirms migration and status updates are complete.
 *****/

require('mocha')
const {expect} = require('chai')
const {newUser, fetchJson, existingUser, callFioApiSigned, callFioApi, timeout} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/fiosdk')
config = require('../config.js');

/*
  #bp1:dapix
  #Private key: 5KQ6f9ZgUtagD3LZ4wcMKhhvK9qy4BuwL3L1pkm6E2v62HCne2R
  #Public key: FIO7jVQXMNLzSncm7kxwg9gk7XUBYQeJPk8b6QfaK5NVNkh3QZrRr
  #FIO Public Address (actor name): qbxn5zhw2ypw

  #bp2:dapix
  #Private key: 5JnhMxfnLhZeRCRvCUsaHbrvPSxaqjkQAgw4ZFodx4xXyhZbC9P
  #Public key: FIO7uTisye5w2hgrCSE1pJhBKHfqDzhvqDJJ4U3vN9mbYWzataS2b
  #FIO Public Address (actor name): hfdg2qumuvlc

  #bp3:dapix
  #Private key: 5JvmPVxPxypQEKPwFZQW4Vx7EC8cDYzorVhSWZvuYVFMccfi5mU
  #Public key: FIO6oa5UV9ghWgYH9en8Cv8dFcAxnZg2i9z9gKbnHahciuKNRPyHc
  #FIO Public Address (actor name): wttywsmdmfew
*/

let bp1, bp2, bp3;
let amount = 5;

before(async () => {
  faucet = new FIOSDK(config.FAUCET_PRIV_KEY, config.FAUCET_PUB_KEY, config.BASE_URL, fetchJson);

  // Create sdk objects for the orinigal localhost BPs
  bp1 = await existingUser('qbxn5zhw2ypw', '5KQ6f9ZgUtagD3LZ4wcMKhhvK9qy4BuwL3L1pkm6E2v62HCne2R', 'FIO7jVQXMNLzSncm7kxwg9gk7XUBYQeJPk8b6QfaK5NVNkh3QZrRr', 'dapixdev', 'bp1@dapixdev');
  bp2 = await existingUser('hfdg2qumuvlc', '5JnhMxfnLhZeRCRvCUsaHbrvPSxaqjkQAgw4ZFodx4xXyhZbC9P', 'FIO7uTisye5w2hgrCSE1pJhBKHfqDzhvqDJJ4U3vN9mbYWzataS2b', 'dapixdev', 'bp2@dapixdev');
  bp3 = await existingUser('wttywsmdmfew', '5JvmPVxPxypQEKPwFZQW4Vx7EC8cDYzorVhSWZvuYVFMccfi5mU', 'FIO6oa5UV9ghWgYH9en8Cv8dFcAxnZg2i9z9gKbnHahciuKNRPyHc', 'dapixdev', 'bp3@dapixdev');

})

describe.skip(`************************** bravo-migr-test.js ************************** \n    fiotrxtss (original table) scripts`, () => {

  describe.skip(`A. Load Requests and OBTs`, () => {
      let user1, user2, user3;
      let payment = 3000000000;
      let requestMemo = 'We are here 2';
      let count = 1;

      it(`Create users`, async () => {
          user1 = await newUser(faucet);
          user2 = await newUser(faucet);
          user3 = await newUser(faucet);

          //console.log('user1: ' + user1.account + ', ' + user1.privateKey + ', ' + user1.publicKey)
          //console.log('user2: ' + user2.account + ', ' + user2.privateKey + ', ' + user2.publicKey)
          //console.log('user3: ' + user3.account + ', ' + user3.privateKey + ', ' + user3.publicKey)
      })

      it(`${count}x - user1 requests funds from user2`, async () => {
          for (i = 0; i < count; i++) {
            try {
              const result = await user1.sdk.genericAction('requestFunds', {
                payerFioAddress: user2.address,
                payeeFioAddress: user1.address,
                payeeTokenPublicAddress: user1.address,
                amount: payment,
                chainCode: 'FIO',
                tokenCode: 'FIO',
                memo: requestMemo,
                maxFee: config.api.new_funds_request.fee,
                payerFioPublicKey: user2.publicKey,
                technologyProviderId: '',
                hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
                offlineUrl: ''
              })
              //console.log('Result: ', result)
              expect(result.status).to.equal('requested')
            } catch (err) {
              console.log('Error', err.json)
              expect(err).to.equal(null)
            }
          }
      })

      it(`${count}x - user2 requests funds from user1`, async () => {
          for (i = 0; i < count; i++) {
            try {
              const result = await user2.sdk.genericAction('requestFunds', {
                payerFioAddress: user1.address,
                payeeFioAddress: user2.address,
                payeeTokenPublicAddress: user2.address,
                amount: payment,
                chainCode: 'FIO',
                tokenCode: 'FIO',
                memo: requestMemo,
                maxFee: config.api.new_funds_request.fee,
                payerFioPublicKey: user1.publicKey,
                technologyProviderId: '',
                hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
                offlineUrl: ''
              })
              //console.log('Result: ', result)
              expect(result.status).to.equal('requested')
            } catch (err) {
              console.log('Error', err.json)
              expect(err).to.equal(null)
            }
          }
      })

      it(`${count}x - user3 requests funds from user2, user2 rejects request`, async () => {
          let requestId;
          for (i = 0; i < count; i++) {
              try {
                  const result = await user3.sdk.genericAction('requestFunds', {
                      payerFioAddress: user2.address,
                      payeeFioAddress: user3.address,
                      payeeTokenPublicAddress: user3.address,
                      amount: payment,
                      chainCode: 'FIO',
                      tokenCode: 'FIO',
                      memo: requestMemo,
                      maxFee: config.api.new_funds_request.fee,
                      payerFioPublicKey: user2.publicKey,
                      technologyProviderId: '',
                      hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
                      offlineUrl: ''
                  })
                  //console.log('Result: ', result)
                  requestId = result.fio_request_id;
                  expect(result.status).to.equal('requested')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }

              try {
                  const result = await user2.sdk.genericAction('pushTransaction', {
                      action: 'rejectfndreq',
                      account: 'fio.reqobt',
                      data: {
                          fio_request_id: requestId,
                          max_fee: config.api.cancel_funds_request.fee,
                          tpid: '',
                          actor: user2.account
                      }
                  })
                  //console.log('Result:', result)
                  expect(result.status).to.equal('request_rejected') 
              } catch (err) {
                  console.log('Error', err)
                  expect(err).to.equal(null)
              }
          }
      })

      it(`${count}x - user2 requests funds from user1, user 1 records OBT response`, async () => {
          let requestId;
          for (i = 0; i < count; i++) {
              try {
                  const result = await user2.sdk.genericAction('requestFunds', {
                      payerFioAddress: user1.address,
                      payeeFioAddress: user2.address,
                      payeeTokenPublicAddress: user2.address,
                      amount: payment,
                      chainCode: 'FIO',
                      tokenCode: 'FIO',
                      memo: requestMemo,
                      maxFee: config.api.new_funds_request.fee,
                      payerFioPublicKey: user1.publicKey,
                      technologyProviderId: '',
                      hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
                      offlineUrl: ''
                  })
                  //console.log('Result: ', result)
                  requestId = result.fio_request_id;
                  expect(result.status).to.equal('requested')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }

            try {
              const result = await user1.sdk.genericAction('recordObtData', {
                      fioRequestId: requestId,
                      payerFioAddress: user1.address,
                      payeeFioAddress: user2.address,
                      payerTokenPublicAddress: user1.publicKey,
                      payeeTokenPublicAddress: user2.publicKey,
                      amount: payment,
                      chainCode: "FIO",
                      tokenCode: "FIO",
                      status: '',
                      obtId: '',
                      maxFee: config.api.record_obt_data.fee,
                      technologyProviderId: '',
                      payeeFioPublicKey: user2.publicKey,
                      memo: 'this is a test',
                      hash: '',
                      offLineUrl: ''
                  })
                  //console.log('Result: ', result)
                  expect(result.status).to.equal('sent_to_blockchain')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }
          }
      })

      it(`${count}x user3 creates BTC OBT send record to user1`, async () => {
          for (i = 0; i < count; i++) {
              try {
                  const result = await user3.sdk.genericAction('recordObtData', {
                    fioRequestId: '',
                    payerFioAddress: user3.address,
                    payeeFioAddress: user1.address,
                    payerTokenPublicAddress: user3.publicKey,
                    payeeTokenPublicAddress: user1.publicKey,
                    amount: payment,
                    chainCode: "BTC",
                    tokenCode: "BTC",
                    status: '',
                    obtId: '',
                    maxFee: config.api.record_obt_data.fee,
                    technologyProviderId: '',
                    payeeFioPublicKey: user1.publicKey,
                    memo: 'this is a test',
                    hash: '',
                    offLineUrl: ''
                  })
                  //console.log('Result: ', result)
                  expect(result.status).to.equal('sent_to_blockchain')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }
          }
      })
    
      it('Echo migrledgers table', async () => {
        try {
          const json = {
            json: true,
            code: 'fio.reqobt',
            scope: 'fio.reqobt',
            table: 'migrledgers',
            limit: 10,
            reverse: false,
            show_payer: false
          }
          ledger = await callFioApi("get_table_rows", json);
          console.log('migrledgers: ', ledger);
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      })
  })

  describe(`B. xPerform single migrtrx to initialize migration`, () => {

    it(`Call single migrtrx (bp1) and confirm you can still do Requests and OBTs`, async () => {
        try {
            const result = await callFioApiSigned('push_transaction', {
                action: 'migrtrx',
                account: 'fio.reqobt',
                actor: bp1.account,
                privKey: bp1.privateKey,
                data: {
                    amount: 10,
                    actor: bp1.account
                }
            })
            //console.log('Result: ', result)
            expect(result.transaction_id).to.exist
        } catch (err) {
            console.log('Error: ', err)
            expect(err).to.equal(null)
        }
      })

      it.skip('Call get_table_rows from fiotrxtss (NEW table) and display', async () => {
        try {
          const json = {
            json: true,               // Get the response as json
            code: 'fio.reqobt',      // Contract that we target
            scope: 'fio.reqobt',         // Account that owns the data
            table: 'fiotrxtss',        // Table name
            limit: 1000,                // Maximum number of rows that we want to get
            reverse: false,           // Optional: Get reversed data
            show_payer: false          // Optional: Show ram payer
          }
          requests = await callFioApi("get_table_rows", json);
          console.log('requests: ', requests); 
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      })
    
      it('Echo migrledgers table', async () => {
        try {
          const json = {
            json: true,
            code: 'fio.reqobt',
            scope: 'fio.reqobt',
            table: 'migrledgers',
            limit: 10,
            reverse: false,
            show_payer: false
          }
          ledger = await callFioApi("get_table_rows", json);
          console.log('migrledgers: ', ledger);
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      })
  })

  describe(`C. xInitial OBT record. Confirm new OBT Sends are going into both tables`, () => {
    let user1, user2, user3
    let payment = 3000000000;

    it(`Create users`, async () => {
        user1 = await newUser(faucet);
        user2 = await newUser(faucet);
        user3 = await newUser(faucet);

        //console.log('user1: ' + user1.account + ', ' + user1.privateKey + ', ' + user1.publicKey)
        //console.log('user2: ' + user2.account + ', ' + user2.privateKey + ', ' + user2.publicKey)
        //console.log('user3: ' + user3.account + ', ' + user3.privateKey + ', ' + user3.publicKey)
    })


    it(`user3 creates BTC OBT send record to user1`, async () => {
      try {
        const result = await user3.sdk.genericAction('recordObtData', {
              fioRequestId: '',
              payerFioAddress: user3.address,
              payeeFioAddress: user1.address,
              payerTokenPublicAddress: user3.publicKey,
              payeeTokenPublicAddress: user1.publicKey,
              amount: payment,
              chainCode: "BTC",
              tokenCode: "BTC",
              status: '',
              obtId: '',
              maxFee: config.api.record_obt_data.fee,
              technologyProviderId: '',
              payeeFioPublicKey: user1.publicKey,
              memo: 'this is a test',
              hash: '',
              offLineUrl: ''
          })
          //console.log('Result: ', result)
          expect(result.status).to.equal('sent_to_blockchain')
      } catch (err) {
          console.log('Error', err.json)
          expect(err).to.equal(null)
      }
    })

    it('Call get_table_rows from recordobts (old table) and confirm OBT is in table', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'recordobts',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        obts = await callFioApi("get_table_rows", json);
        //console.log('obts: ', obts);
        for (request in obts.rows) {
          if (obts.rows[request].payer_fio_addr == user3.address) {
            //console.log('payer_fio_addr: ', obts.rows[request].payer_fio_addr); 
            break;
          }
        }
        expect(obts.rows[request].payer_fio_addr).to.equal(user3.address);  
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it('Call get_table_rows from fiotrxtss (NEW table) and confirm request is in table', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fiotrxtss',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        requests = await callFioApi("get_table_rows", json);
        //console.log('requests: ', requests);
        for (request in requests.rows) {
          if (requests.rows[request].payer_fio_addr == user3.address) {
            //console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
            break;
          }
        }
        expect(requests.rows[request].payer_fio_addr).to.equal(user3.address);  
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it('Echo initial migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'migrledgers',
          limit: 10,
          reverse: false,
          show_payer: false
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

  describe(`E. xInitial FIO Request record. Confirm NEW Requests are going into both tables`, () => {
    let user1, user2, user3, requestId, obtId
    let payment = 3000000000;
    let requestMemo = 'asdf';

    it(`Create users`, async () => {
        user1 = await newUser(faucet);
        user2 = await newUser(faucet);
        user3 = await newUser(faucet);

        //console.log('user1: ' + user1.account + ', ' + user1.privateKey + ', ' + user1.publicKey)
        //console.log('user2: ' + user2.account + ', ' + user2.privateKey + ', ' + user2.publicKey)
        //console.log('user3: ' + user3.account + ', ' + user3.privateKey + ', ' + user3.publicKey)
    })

    it(`user1 requests funds from user2`, async () => {
      try {
          const result = await user1.sdk.genericAction('requestFunds', {
              payerFioAddress: user2.address,
              payeeFioAddress: user1.address,
              payeeTokenPublicAddress: user1.address,
              amount: payment,
              chainCode: 'FIO',
              tokenCode: 'FIO',
              memo: requestMemo,
              maxFee: config.api.new_funds_request.fee,
              payerFioPublicKey: user2.publicKey,
              technologyProviderId: '',
              hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
              offlineUrl: ''
          })
          //console.log('Result: ', result)
          requestId = result.fio_request_id;
          expect(result.status).to.equal('requested')
      } catch (err) {
          console.log('Error', err.json)
          expect(err).to.equal(null)
      }
    })

    it('Requests: Call get_table_rows from fioreqctxts (old table) and confirm request is in table', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fioreqctxts',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        requests = await callFioApi("get_table_rows", json);
        //console.log('requests: ', requests);
        for (request in requests.rows) {
          if (requests.rows[request].fio_request_id == requestId) {
            //console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
            break;
          }
        }
        expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);  
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it('Call get_table_rows from fiotrxtss (NEW table) and confirm request is in table', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fiotrxtss',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        requests = await callFioApi("get_table_rows", json);
        //console.log('requests: ', requests);
        for (request in requests.rows) {
          if (requests.rows[request].fio_request_id == requestId) {
            //console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
            break;
          }
        }
        expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);  
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it('Echo initial migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'migrledgers',
          limit: 10,
          reverse: false,
          show_payer: false
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

  describe(`F. Confirm REJECTED Requests are going into both tables`, () => {
      let user1, user2, user3, requestId
      let payment = 3000000000;
      let requestMemo = 'asdf';

      it(`Create users`, async () => {
          user1 = await newUser(faucet);
          user2 = await newUser(faucet);
          user3 = await newUser(faucet);
      })


      it(`user3 requests funds from user2, user2 rejects request`, async () => {
          let requestId;
          for (i = 0; i < count; i++) {
              try {
                  const result = await user3.sdk.genericAction('requestFunds', {
                      payerFioAddress: user2.address,
                      payeeFioAddress: user3.address,
                      payeeTokenPublicAddress: user3.address,
                      amount: payment,
                      chainCode: 'FIO',
                      tokenCode: 'FIO',
                      memo: requestMemo,
                      maxFee: config.api.new_funds_request.fee,
                      payerFioPublicKey: user2.publicKey,
                      technologyProviderId: '',
                      hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
                      offlineUrl: ''
                  })
                  //console.log('Result: ', result)
                  requestId = result.fio_request_id;
                  expect(result.status).to.equal('requested')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }

              try {
                  const result = await user2.sdk.genericAction('pushTransaction', {
                      action: 'rejectfndreq',
                      account: 'fio.reqobt',
                      data: {
                          fio_request_id: requestId,
                          max_fee: config.api.cancel_funds_request.fee,
                          tpid: '',
                          actor: user2.account
                      }
                  })
                  //console.log('Result:', result)
                  expect(result.status).to.equal('request_rejected') 
              } catch (err) {
                  console.log('Error', err)
                  expect(err).to.equal(null)
              }
          }
      })

          it('Requests: Call get_table_rows from fioreqctxts (old table) and confirm request is in table', async () => {
          try {
              const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fioreqctxts',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
              }
              requests = await callFioApi("get_table_rows", json);
              console.log('requests: ', requests);
              for (request in requests.rows) {
              if (requests.rows[request].fio_request_id == requestId) {
                  console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
                  break;
              }
              }
              expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);  
          } catch (err) {
              console.log('Error', err);
              expect(err).to.equal(null);
          }
          })

          it('Call get_table_rows from fiotrxtss (NEW table) and confirm request is in table', async () => {
          try {
              const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fiotrxtss',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
              }
              requests = await callFioApi("get_table_rows", json);
              console.log('requests: ', requests);
              for (request in requests.rows) {
              if (requests.rows[request].fio_request_id == requestId) {
                  console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
                  break;
              }
              }
              expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);  
          } catch (err) {
              console.log('Error', err);
              expect(err).to.equal(null);
          }
          })

  })

  describe.skip(`G. Confirm paid OBT response Requests are going into both tables`, () => {
      let user1, user2, user3, requestId
      let payment = 3000000000;
      let requestMemo = 'asdf';

      it(`Create users`, async () => {
          user1 = await newUser(faucet);
          user2 = await newUser(faucet);
          user3 = await newUser(faucet);

          console.log('user1: ' + user1.account + ', ' + user1.privateKey + ', ' + user1.publicKey)
          console.log('user2: ' + user2.account + ', ' + user2.privateKey + ', ' + user2.publicKey)
          console.log('user3: ' + user3.account + ', ' + user3.privateKey + ', ' + user3.publicKey)
      })


      it(`user2 requests funds from user1, user 1 records OBT response`, async () => {
          let requestId;
              try {
                  const result = await user2.sdk.genericAction('requestFunds', {
                      payerFioAddress: user1.address,
                      payeeFioAddress: user2.address,
                      payeeTokenPublicAddress: user2.address,
                      amount: payment,
                      chainCode: 'FIO',
                      tokenCode: 'FIO',
                      memo: requestMemo,
                      maxFee: config.api.new_funds_request.fee,
                      payerFioPublicKey: user1.publicKey,
                      technologyProviderId: '',
                      hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
                      offlineUrl: ''
                  })
                  //console.log('Result: ', result)
                  requestId = result.fio_request_id;
                  expect(result.status).to.equal('requested')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }

            try {
                  const result = await user1.sdk.genericAction('recordObtData', {
                    fioRequestId: requestId,
                    payerFioAddress: user1.address,
                    payeeFioAddress: user2.address,
                    payerTokenPublicAddress: user1.publicKey,
                    payeeTokenPublicAddress: user2.publicKey,
                    amount: payment,
                    chainCode: "FIO",
                    tokenCode: "FIO",
                    status: '',
                    obtId: '',
                    maxFee: config.api.record_obt_data.fee,
                    technologyProviderId: '',
                    payeeFioPublicKey: user2.publicKey,
                    memo: 'this is a test',
                    hash: '',
                    offLineUrl: ''
                  })
                  //console.log('Result: ', result)
                  expect(result.status).to.equal('sent_to_blockchain')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }
      })

      it('Call get_table_rows from recordobts (old table) and confirm OBT is in table', async () => {
          try {
            const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'recordobts',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
            }
            obts = await callFioApi("get_table_rows", json);
            console.log('obts: ', obts);
            for (request in obts.rows) {
              if (obts.rows[request].id == user1.address) {
                console.log('payer_fio_addr: ', obts.rows[request].requestId); 
                break;
              }
            }
            expect(obts.rows[request].payer_fio_addr).to.equal(user1.address);  
          } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
          }
        })

        it.skip('Requests: Call get_table_rows from fioreqctxts (old table) and confirm request is in table', async () => {
          try {
            const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fioreqctxts',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
            }
            requests = await callFioApi("get_table_rows", json);
            console.log('requests: ', requests);
            for (request in requests.rows) {
              if (requests.rows[request].fio_request_id == requestId) {
                console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
                break;
              }
            }
            expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);  
          } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
          }
        })

        it('Call get_table_rows from fiotrxtss (NEW table) and confirm request is in table', async () => {
          try {
            const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fiotrxtss',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
            }
            requests = await callFioApi("get_table_rows", json);
            console.log('requests: ', requests);
            for (request in requests.rows) {
              if (requests.rows[request].fio_request_id == requestId) {
                console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
                break;
              }
            }
            expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);  
          } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
          }
        })

  })

  describe.skip(`H. xMigrate remaining requests and OBTs`, () => {
    let isFinished = 0

    it('Echo initial migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt', 
          scope: 'fio.reqobt', 
          table: 'migrledgers', 
          limit: 10,               
          reverse: false,         
          show_payer: false  
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it(`Call migrtrx (bp1) with amount = 3 until migrledgers isFinished = 1`, async () => {
      while (!isFinished) {
        try {
            const result = await callFioApiSigned('push_transaction', {
                action: 'migrtrx',
                account: 'fio.reqobt',
                actor: bp1.account,
                privKey: bp1.privateKey,
                data: {
                    amount: 3,
                    actor: bp1.account
                }
            })
            //console.log('Result: ', result)
            expect(result.transaction_id).to.exist
        } catch (err) {
            console.log('Error: ', err)
            expect(err).to.equal(null)
        }
        await timeout(2000);
        try {
          const json = {
            json: true,
            code: 'fio.reqobt', 
            scope: 'fio.reqobt', 
            table: 'migrledgers', 
            limit: 10,               
            reverse: false,         
            show_payer: false  
          }
          ledger = await callFioApi("get_table_rows", json);
          isFinished = ledger.rows[0].isFinished
          //console.log('isFinished: ', isFinished);
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      }
    })

    it('Echo final migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt', 
          scope: 'fio.reqobt', 
          table: 'migrledgers', 
          limit: 10,               
          reverse: false,         
          show_payer: false  
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

  describe.skip(`I. Go through recordobts (old table) and confirm each entry is in fiotrxtss (NEW table)`, () => {
    let obtCount = 0
    let obtRecords;

    it('Step through recordobts and confirm every entry is found on the new table.', async () => {
      let count = 0;

      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'recordobts',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: false,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        obts = await callFioApi("get_table_rows", json);
        obtCount = obts.rows.length;
        //console.log('obts: ', obts);
        console.log('Number of records in recordobts: ', obtCount);
        for (obt in obts.rows) {
          // Call get_table_rows from fiotrxtss (NEW table) and confirm request is in table
          try {
            const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fiotrxtss',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
            }
            newRequests = await callFioApi("get_table_rows", json);
            //console.log('requests: ', newRequests);
            for (newRequest in newRequests.rows) {
              if (newRequests.rows[newRequest].payer_fio_addr == obts.rows[obt].payer_fio_addr) {
                //console.log(count);
                //console.log('recordobts:')
                //console.log('id: ', obts.rows[obt].id);
                //console.log('payer_fio_addr: ', obts.rows[obt].payer_fio_addr); 
                //console.log('payee_fio_addr: ', obts.rows[obt].payee_fio_addr); 
                //console.log('fiotrxtss:')
                //console.log('id: ', newRequests.rows[newRequest].id);
                //console.log('fio_request_id: ', newRequests.rows[newRequest].fio_request_id);
                //console.log('payer_fio_addr: ', newRequests.rows[newRequest].payer_fio_addr); 
                //console.log('payee_fio_addr: ', newRequests.rows[newRequest].payee_fio_addr); 

                expect(obts.rows[obt].payer_fio_addr).to.equal(newRequests.rows[newRequest].payer_fio_addr);
                expect(obts.rows[obt].payee_fio_addr).to.equal(newRequests.rows[newRequest].payee_fio_addr);
                expect(obts.rows[obt].payer_key).to.equal(newRequests.rows[newRequest].payer_key);
                expect(obts.rows[obt].payee_key).to.equal(newRequests.rows[newRequest].payee_key);
                //expect(obts.rows[obt].time_stamp).to.equal(newRequests.rows[newRequest].init_time); //Time stamps different?
                //expect(newRequests.rows[newRequest].fio_request_id).to.equal(0);
                //expect(newRequests.rows[newRequest].fio_data_type).to.equal(4);
                break;
              }
            }
          } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
          }
          count++;
        }
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

  describe.skip(`J. Go through fioreqctxts (old table) and confirm each entry is in fiotrxtss (NEW table)`, () => {
    let reqCount = 0
    let reqs;

    it('Step through fioreqctxts and confirm every entry is found on the new table.', async () => {
      let count = 0;
      let currentReqStatus;

      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fioreqctxts',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: false,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        reqs = await callFioApi("get_table_rows", json);
        reqCount = reqs.rows.length;
        //console.log('reqs: ', reqs);
        console.log('Number of records in fioreqctxts: ', reqCount);
        for (req in reqs.rows) {
          // First, get the status of the request
          try {
            const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fioreqstss',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
            }
            fioReqSts = await callFioApi("get_table_rows", json);
            //console.log('fioReqSts: ', fioReqSts);
            currentReqStatus = 0; //Initialize to 0 since that will be the status in the new table if the record's fio_request_id is not found in fioreqstss
            for (fioReqStatus in fioReqSts.rows) {
              //console.log('reqs.rows[req].fio_request_id', reqs.rows[req].fio_request_id)
              //console.log('fioReqStatus: ', fioReqSts.rows[fioReqStatus]);
              //console.log ('currentReqStatus', fioReqSts.rows[fioReqStatus].status);
              if (fioReqSts.rows[fioReqStatus].fio_request_id == reqs.rows[req].fio_request_id) {
                currentReqStatus = fioReqSts.rows[fioReqStatus].status;
                //console.log('id: ', fioReqSts.rows[fioReqStatus].id);
                //console.log('fio_request_id: ', fioReqSts.rows[fioReqStatus].fio_request_id);
                //console.log('status: ', fioReqSts.rows[fioReqStatus].status);
                //console.log('payer_fio_addr: ', fioReqSts.rows[fioReqStatus].time_stamp); 
                expect(reqs.rows[req].fio_request_id).to.equal(fioReqSts.rows[fioReqStatus].fio_request_id);
                break;
              }
            }
          } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
          }

          // Next, all get_table_rows from fiotrxtss (NEW table) and confirm request is in table
          try {
            const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fiotrxtss',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
            }
            newRequests = await callFioApi("get_table_rows", json);
            //console.log('requests: ', newRequests);
            for (newRequest in newRequests.rows) {
              if (newRequests.rows[newRequest].fio_request_id == reqs.rows[req].fio_request_id) {
                //console.log(count);
                //console.log('fioreqctxts:')
                //console.log('fio_request_id: ', reqs.rows[req].fio_request_id);
                //console.log('payer_fio_addr: ', reqs.rows[req].payer_fio_addr); 
                //console.log('payee_fio_addr: ', reqs.rows[req].payee_fio_addr); 
                //console.log('fioreqstss:')
                //console.log('status (0 = not found): ', currentReqStatus);
                //console.log('fiotrxtss:')
                //console.log('id: ', newRequests.rows[newRequest].id);
                //console.log('fio_request_id: ', newRequests.rows[newRequest].fio_request_id);
                //console.log('payer_fio_addr: ', newRequests.rows[newRequest].payer_fio_addr); 
                //console.log('payee_fio_addr: ', newRequests.rows[newRequest].payee_fio_addr); 
                //console.log('fio_data_type: ', newRequests.rows[newRequest].fio_data_type); 

                expect(reqs.rows[req].payer_fio_addr).to.equal(newRequests.rows[newRequest].payer_fio_addr);
                expect(reqs.rows[req].payee_fio_addr).to.equal(newRequests.rows[newRequest].payee_fio_addr);
                expect(reqs.rows[req].payer_key).to.equal(newRequests.rows[newRequest].payer_key);
                expect(reqs.rows[req].payee_key).to.equal(newRequests.rows[newRequest].payee_key);
                //expect(reqs.rows[req].time_stamp).to.equal(newRequests.rows[newRequest].init_time); //Time stamps different?
                expect(reqs.rows[req].fio_request_id).to.equal(newRequests.rows[newRequest].fio_request_id);
                expect(newRequests.rows[newRequest].fio_data_type).to.equal(currentReqStatus);
                break;
              }
            }
          } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
          }
          count++;
        }
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

})

describe.skip(`NUKE Bravo: Call migrtrx until table data is nuked`, () => {
  let isFinished = 0

  it('Echo initial migrledgers table', async () => {
    try {
      const json = {
        json: true,
        code: 'fio.reqobt', 
        scope: 'fio.reqobt', 
        table: 'migrledgers', 
        limit: 1000,               
        reverse: false,         
        show_payer: false  
      }
      ledger = await callFioApi("get_table_rows", json);
      console.log('migrledgers: ', ledger);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it(`Call migrtrx (bp1) with amount = 10 until migrtrx is empty`, async () => {
    while (!isFinished) {
      try {
          const result = await callFioApiSigned('push_transaction', {
              action: 'migrtrx',
              account: 'fio.reqobt',
              actor: bp1.account,
              privKey: bp1.privateKey,
              data: {
                  amount: 10,
                  actor: bp1.account
              }
          })
          console.log('Result: ', result)
          expect(result.transaction_id).to.exist
      } catch (err) {
          console.log('Error: ', err)
          expect(err).to.equal(null)
      }
      await timeout(2000);
      try {
        const json = {
          json: true,
          code: 'fio.reqobt', 
          scope: 'fio.reqobt', 
          table: 'fiotrxtss', 
          limit: 1000,               
          reverse: false,         
          show_payer: false  
        }
        fiotrxtss = await callFioApi("get_table_rows", json);
        isFinished = (fiotrxtss.rows.length == 0);
        //console.log('fiotrxtss: ', fiotrxtss)
        console.log('Table rows count: ', fiotrxtss.rows.length)
        console.log('isFinished: ', isFinished);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    }
  })

  it('Confirm migrledgers table is empty', async () => {
    try {
      const json = {
        json: true,
        code: 'fio.reqobt', 
        scope: 'fio.reqobt', 
        table: 'migrledgers', 
        limit: 10,               
        reverse: false,         
        show_payer: false  
      }
      migrledgers = await callFioApi("get_table_rows", json);
      console.log('migrledgers: ', migrledgers);
      expect(migrledgers.rows.length).to.equal(0);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('Confirm fiotrxtss table is empty', async () => {
    try {
      const json = {
        json: true,
        code: 'fio.reqobt', 
        scope: 'fio.reqobt', 
        table: 'fiotrxtss', 
        limit: 10,               
        reverse: false,         
        show_payer: false  
      }
      fiotrxtss = await callFioApi("get_table_rows", json);
      console.log('fiotrxtss: ', fiotrxtss);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

})

describe.skip(`Release v2.3.2 - fiotrxtss (NEW table) scripts`, () => {

  describe(`A. Load Requests and OBTs`, () => {
      let user1, user2, user3;
      let payment = 3000000000;
      let requestMemo = 'asdf';
      let count = 5;

      it(`Create users`, async () => {
          user1 = await newUser(faucet);
          user2 = await newUser(faucet);
          user3 = await newUser(faucet);

          //console.log('user1: ' + user1.account + ', ' + user1.privateKey + ', ' + user1.publicKey)
          //console.log('user2: ' + user2.account + ', ' + user2.privateKey + ', ' + user2.publicKey)
          //console.log('user3: ' + user3.account + ', ' + user3.privateKey + ', ' + user3.publicKey)
      })

      it(`${count}x - user1 requests funds from user2`, async () => {
          for (i = 0; i < count; i++) {
            try {
              const result = await user1.sdk.genericAction('requestFunds', {
                payerFioAddress: user2.address,
                payeeFioAddress: user1.address,
                payeeTokenPublicAddress: user1.address,
                amount: payment,
                chainCode: 'FIO',
                tokenCode: 'FIO',
                memo: requestMemo,
                maxFee: config.api.new_funds_request.fee,
                payerFioPublicKey: user2.publicKey,
                technologyProviderId: '',
                hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
                offlineUrl: ''
              })
              //console.log('Result: ', result)
              expect(result.status).to.equal('requested')
            } catch (err) {
              console.log('Error', err.json)
              expect(err).to.equal(null)
            }
          }
      })

      it(`${count}x - user2 requests funds from user1`, async () => {
          for (i = 0; i < count; i++) {
            try {
              const result = await user2.sdk.genericAction('requestFunds', {
                payerFioAddress: user1.address,
                payeeFioAddress: user2.address,
                payeeTokenPublicAddress: user2.address,
                amount: payment,
                chainCode: 'FIO',
                tokenCode: 'FIO',
                memo: requestMemo,
                maxFee: config.api.new_funds_request.fee,
                payerFioPublicKey: user1.publicKey,
                technologyProviderId: '',
                hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
                offlineUrl: ''
              })
              //console.log('Result: ', result)
              expect(result.status).to.equal('requested')
            } catch (err) {
              console.log('Error', err.json)
              expect(err).to.equal(null)
            }
          }
      })

      it(`${count}x - user3 requests funds from user2, user2 rejects request`, async () => {
          let requestId;
          for (i = 0; i < count; i++) {
              try {
                  const result = await user3.sdk.genericAction('requestFunds', {
                      payerFioAddress: user2.address,
                      payeeFioAddress: user3.address,
                      payeeTokenPublicAddress: user3.address,
                      amount: payment,
                      chainCode: 'FIO',
                      tokenCode: 'FIO',
                      memo: requestMemo,
                      maxFee: config.api.new_funds_request.fee,
                      payerFioPublicKey: user2.publicKey,
                      technologyProviderId: '',
                      hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
                      offlineUrl: ''
                  })
                  //console.log('Result: ', result)
                  requestId = result.fio_request_id;
                  expect(result.status).to.equal('requested')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }
              await timeout(2000);
              try {
                  const result = await user2.sdk.genericAction('pushTransaction', {
                      action: 'rejectfndreq',
                      account: 'fio.reqobt',
                      data: {
                          fio_request_id: requestId,
                          max_fee: config.api.cancel_funds_request.fee,
                          tpid: '',
                          actor: user2.account
                      }
                  })
                  //console.log('Result:', result)
                  expect(result.status).to.equal('request_rejected') 
              } catch (err) {
                  console.log('Error', err)
                  expect(err).to.equal(null)
              }
          }
      })

      it(`${count}x - user2 requests funds from user1, user 1 records OBT response`, async () => {
          let requestId;
          for (i = 0; i < count; i++) {
              try {
                  const result = await user2.sdk.genericAction('requestFunds', {
                      payerFioAddress: user1.address,
                      payeeFioAddress: user2.address,
                      payeeTokenPublicAddress: user2.address,
                      amount: payment,
                      chainCode: 'FIO',
                      tokenCode: 'FIO',
                      memo: requestMemo,
                      maxFee: config.api.new_funds_request.fee,
                      payerFioPublicKey: user1.publicKey,
                      technologyProviderId: '',
                      hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
                      offlineUrl: ''
                  })
                  //console.log('Result: ', result)
                  requestId = result.fio_request_id;
                  expect(result.status).to.equal('requested')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }
              await timeout(2000);
            try {
                  const result = await user1.sdk.genericAction('recordObtData', {
                    fioRequestId: requestId,
                    payerFioAddress: user1.address,
                    payeeFioAddress: user2.address,
                    payerTokenPublicAddress: user1.publicKey,
                    payeeTokenPublicAddress: user2.publicKey,
                    amount: payment,
                    chainCode: "FIO",
                    tokenCode: "FIO",
                    status: '',
                    obtId: '',
                    maxFee: config.api.record_obt_data.fee,
                    technologyProviderId: '',
                    payeeFioPublicKey: user2.publicKey,
                    memo: 'this is a test',
                    hash: '',
                    offLineUrl: ''
                  })
                  //console.log('Result: ', result)
                  expect(result.status).to.equal('sent_to_blockchain')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }
          }
      })

      it(`${count}x user3 creates BTC OBT send record to user1`, async () => {
          for (i = 0; i < count; i++) {
              try {
                  const result = await user3.sdk.genericAction('recordObtData', {
                    fioRequestId: '',
                    payerFioAddress: user3.address,
                    payeeFioAddress: user1.address,
                    payerTokenPublicAddress: user3.publicKey,
                    payeeTokenPublicAddress: user1.publicKey,
                    amount: payment,
                    chainCode: "BTC",
                    tokenCode: "BTC",
                    status: '',
                    obtId: '',
                    maxFee: config.api.record_obt_data.fee,
                    technologyProviderId: '',
                    payeeFioPublicKey: user1.publicKey,
                    memo: 'this is a test',
                    hash: '',
                    offLineUrl: ''
                  })
                  //console.log('Result: ', result)
                  expect(result.status).to.equal('sent_to_blockchain')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }
          }
      })
  })

  describe(`B. Perform single migrtrx to initialize migration`, () => {

    it(`Call single migrtrx (bp1) and confirm you can still do Requests and OBTs`, async () => {
        try {
            const result = await callFioApiSigned('push_transaction', {
                action: 'migrtrx',
                account: 'fio.reqobt',
                actor: bp1.account,
                privKey: bp1.privateKey,
                data: {
                    amount: 20,
                    actor: bp1.account
                }
            })
            //console.log('Result: ', result)
            expect(result.transaction_id).to.exist
        } catch (err) {
            console.log('Error: ', err)
            expect(err).to.equal(null)
        }
      })

      it.skip('Call get_table_rows from fiotrxtss (NEW table) and display', async () => {
        try {
          const json = {
            json: true,               // Get the response as json
            code: 'fio.reqobt',      // Contract that we target
            scope: 'fio.reqobt',         // Account that owns the data
            table: 'fiotrxtss',        // Table name
            limit: 1000,                // Maximum number of rows that we want to get
            reverse: false,           // Optional: Get reversed data
            show_payer: false          // Optional: Show ram payer
          }
          requests = await callFioApi("get_table_rows", json);
          console.log('requests: ', requests); 
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      })
  })

  describe(`C. Initial OBT record. Confirm new OBT Sends are going into both tables`, () => {
    let user1, user2, user3
    let payment = 3000000000;

    it(`Create users`, async () => {
        user1 = await newUser(faucet);
        user2 = await newUser(faucet);
        user3 = await newUser(faucet);

        //console.log('user1: ' + user1.account + ', ' + user1.privateKey + ', ' + user1.publicKey)
        //console.log('user2: ' + user2.account + ', ' + user2.privateKey + ', ' + user2.publicKey)
        //console.log('user3: ' + user3.account + ', ' + user3.privateKey + ', ' + user3.publicKey)
    })


    it(`user3 creates BTC OBT send record to user1`, async () => {
      try {
          const result = await user3.sdk.genericAction('recordObtData', {
            fioRequestId: '',
            payerFioAddress: user3.address,
            payeeFioAddress: user1.address,
            payerTokenPublicAddress: user3.publicKey,
            payeeTokenPublicAddress: user1.publicKey,
            amount: payment,
            chainCode: "BTC",
            tokenCode: "BTC",
            status: '',
            obtId: '',
            maxFee: config.api.record_obt_data.fee,
            technologyProviderId: '',
            payeeFioPublicKey: user1.publicKey,
            memo: 'this is a test',
            hash: '',
            offLineUrl: ''
          })
          //console.log('Result: ', result)
          expect(result.status).to.equal('sent_to_blockchain')
      } catch (err) {
          console.log('Error', err.json)
          expect(err).to.equal(null)
      }
    })

    it('Call get_table_rows from recordobts (old table) and confirm OBT is in table', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'recordobts',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        obts = await callFioApi("get_table_rows", json);
        //console.log('obts: ', obts);
        for (request in obts.rows) {
          if (obts.rows[request].payer_fio_addr == user3.address) {
            //console.log('payer_fio_addr: ', obts.rows[request].payer_fio_addr); 
            break;
          }
        }
        expect(obts.rows[request].payer_fio_addr).to.equal(user3.address);  
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it('Call get_table_rows from fiotrxtss (NEW table) and confirm request is in table', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fiotrxtss',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        requests = await callFioApi("get_table_rows", json);
        //console.log('requests: ', requests);
        for (request in requests.rows) {
          if (requests.rows[request].payer_fio_addr == user3.address) {
            //console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
            break;
          }
        }
        expect(requests.rows[request].payer_fio_addr).to.equal(user3.address);  
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

  describe(`E. Initial FIO Request record. Confirm NEW Requests are going into both tables`, () => {
    let user1, user2, user3, requestId, obtId
    let payment = 3000000000;
    let requestMemo = 'asdf';

    it(`Create users`, async () => {
        user1 = await newUser(faucet);
        user2 = await newUser(faucet);
        user3 = await newUser(faucet);

        //console.log('user1: ' + user1.account + ', ' + user1.privateKey + ', ' + user1.publicKey)
        //console.log('user2: ' + user2.account + ', ' + user2.privateKey + ', ' + user2.publicKey)
        //console.log('user3: ' + user3.account + ', ' + user3.privateKey + ', ' + user3.publicKey)
    })

    it(`user1 requests funds from user2`, async () => {
      try {
          const result = await user1.sdk.genericAction('requestFunds', {
              payerFioAddress: user2.address,
              payeeFioAddress: user1.address,
              payeeTokenPublicAddress: user1.address,
              amount: payment,
              chainCode: 'FIO',
              tokenCode: 'FIO',
              memo: requestMemo,
              maxFee: config.api.new_funds_request.fee,
              payerFioPublicKey: user2.publicKey,
              technologyProviderId: '',
              hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
              offlineUrl: ''
          })
          //console.log('Result: ', result)
          requestId = result.fio_request_id;
          expect(result.status).to.equal('requested')
      } catch (err) {
          console.log('Error', err.json)
          expect(err).to.equal(null)
      }
    })

    it('Requests: Call get_table_rows from fioreqctxts (old table) and confirm request is in table', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fioreqctxts',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        requests = await callFioApi("get_table_rows", json);
        //console.log('requests: ', requests);
        for (request in requests.rows) {
          if (requests.rows[request].fio_request_id == requestId) {
            //console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
            break;
          }
        }
        expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);  
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it('Call get_table_rows from fiotrxtss (NEW table) and confirm request is in table', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fiotrxtss',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        requests = await callFioApi("get_table_rows", json);
        //console.log('requests: ', requests);
        for (request in requests.rows) {
          if (requests.rows[request].fio_request_id == requestId) {
            //console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
            break;
          }
        }
        expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);  
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

  describe.skip(`F. Confirm REJECTED Requests are going into both tables`, () => {
      let user1, user2, user3, requestId
      let payment = 3000000000;
      let requestMemo = 'asdf';

      it(`Create users`, async () => {
          user1 = await newUser(faucet);
          user2 = await newUser(faucet);
          user3 = await newUser(faucet);
      })


      it(`user3 requests funds from user2, user2 rejects request`, async () => {
          let requestId;
          for (i = 0; i < count; i++) {
              try {
                  const result = await user3.sdk.genericAction('requestFunds', {
                      payerFioAddress: user2.address,
                      payeeFioAddress: user3.address,
                      payeeTokenPublicAddress: user3.address,
                      amount: payment,
                      chainCode: 'FIO',
                      tokenCode: 'FIO',
                      memo: requestMemo,
                      maxFee: config.api.new_funds_request.fee,
                      payerFioPublicKey: user2.publicKey,
                      technologyProviderId: '',
                      hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
                      offlineUrl: ''
                  })
                  //console.log('Result: ', result)
                  requestId = result.fio_request_id;
                  expect(result.status).to.equal('requested')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }

              try {
                  const result = await user2.sdk.genericAction('pushTransaction', {
                      action: 'rejectfndreq',
                      account: 'fio.reqobt',
                      data: {
                          fio_request_id: requestId,
                          max_fee: config.api.cancel_funds_request.fee,
                          tpid: '',
                          actor: user2.account
                      }
                  })
                  //console.log('Result:', result)
                  expect(result.status).to.equal('request_rejected') 
              } catch (err) {
                  console.log('Error', err)
                  expect(err).to.equal(null)
              }
          }
      })

          it('Requests: Call get_table_rows from fioreqctxts (old table) and confirm request is in table', async () => {
          try {
              const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fioreqctxts',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
              }
              requests = await callFioApi("get_table_rows", json);
              console.log('requests: ', requests);
              for (request in requests.rows) {
              if (requests.rows[request].fio_request_id == requestId) {
                  console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
                  break;
              }
              }
              expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);  
          } catch (err) {
              console.log('Error', err);
              expect(err).to.equal(null);
          }
          })

          it('Call get_table_rows from fiotrxtss (NEW table) and confirm request is in table', async () => {
          try {
              const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fiotrxtss',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
              }
              requests = await callFioApi("get_table_rows", json);
              console.log('requests: ', requests);
              for (request in requests.rows) {
              if (requests.rows[request].fio_request_id == requestId) {
                  console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
                  break;
              }
              }
              expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);  
          } catch (err) {
              console.log('Error', err);
              expect(err).to.equal(null);
          }
          })

  })

  describe.skip(`G. Confirm paid OBT response Requests are going into both tables`, () => {
      let user1, user2, user3, requestId
      let payment = 3000000000;
      let requestMemo = 'asdf';

      it(`Create users`, async () => {
          user1 = await newUser(faucet);
          user2 = await newUser(faucet);
          user3 = await newUser(faucet);

          console.log('user1: ' + user1.account + ', ' + user1.privateKey + ', ' + user1.publicKey)
          console.log('user2: ' + user2.account + ', ' + user2.privateKey + ', ' + user2.publicKey)
          console.log('user3: ' + user3.account + ', ' + user3.privateKey + ', ' + user3.publicKey)
      })


      it(`user2 requests funds from user1, user 1 records OBT response`, async () => {
          let requestId;
              try {
                  const result = await user2.sdk.genericAction('requestFunds', {
                      payerFioAddress: user1.address,
                      payeeFioAddress: user2.address,
                      payeeTokenPublicAddress: user2.address,
                      amount: payment,
                      chainCode: 'FIO',
                      tokenCode: 'FIO',
                      memo: requestMemo,
                      maxFee: config.api.new_funds_request.fee,
                      payerFioPublicKey: user1.publicKey,
                      technologyProviderId: '',
                      hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
                      offlineUrl: ''
                  })
                  //console.log('Result: ', result)
                  requestId = result.fio_request_id;
                  expect(result.status).to.equal('requested')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }

            try {
                  const result = await user1.sdk.genericAction('recordObtData', {
                    fioRequestId: requestId,
                    payerFioAddress: user1.address,
                    payeeFioAddress: user2.address,
                    payerTokenPublicAddress: user1.publicKey,
                    payeeTokenPublicAddress: user2.publicKey,
                    amount: payment,
                    chainCode: "FIO",
                    tokenCode: "FIO",
                    status: '',
                    obtId: '',
                    maxFee: config.api.record_obt_data.fee,
                    technologyProviderId: '',
                    payeeFioPublicKey: user2.publicKey,
                    memo: 'this is a test',
                    hash: '',
                    offLineUrl: ''
                  })
                  //console.log('Result: ', result)
                  expect(result.status).to.equal('sent_to_blockchain')
              } catch (err) {
                  console.log('Error', err.json)
                  expect(err).to.equal(null)
              }
      })

      it('Call get_table_rows from recordobts (old table) and confirm OBT is in table', async () => {
          try {
            const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'recordobts',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
            }
            obts = await callFioApi("get_table_rows", json);
            console.log('obts: ', obts);
            for (request in obts.rows) {
              if (obts.rows[request].id == user1.address) {
                console.log('payer_fio_addr: ', obts.rows[request].requestId); 
                break;
              }
            }
            expect(obts.rows[request].payer_fio_addr).to.equal(user1.address);  
          } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
          }
        })

        it.skip('Requests: Call get_table_rows from fioreqctxts (old table) and confirm request is in table', async () => {
          try {
            const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fioreqctxts',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
            }
            requests = await callFioApi("get_table_rows", json);
            console.log('requests: ', requests);
            for (request in requests.rows) {
              if (requests.rows[request].fio_request_id == requestId) {
                console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
                break;
              }
            }
            expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);  
          } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
          }
        })

        it('Call get_table_rows from fiotrxtss (NEW table) and confirm request is in table', async () => {
          try {
            const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fiotrxtss',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
            }
            requests = await callFioApi("get_table_rows", json);
            console.log('requests: ', requests);
            for (request in requests.rows) {
              if (requests.rows[request].fio_request_id == requestId) {
                console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
                break;
              }
            }
            expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);  
          } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
          }
        })

  })

  describe(`H. Migrate remaining requests and OBTs`, () => {
    let isFinished = 0

    it('Echo initial migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt', 
          scope: 'fio.reqobt', 
          table: 'migrledgers', 
          limit: 10,               
          reverse: false,         
          show_payer: false  
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it(`Call migrtrx (bp1) with amount = 3 until migrledgers isFinished = 1`, async () => {
      while (!isFinished) {
        try {
            const result = await callFioApiSigned('push_transaction', {
                action: 'migrtrx',
                account: 'fio.reqobt',
                actor: bp1.account,
                privKey: bp1.privateKey,
                data: {
                    amount: 3,
                    actor: bp1.account
                }
            })
            //console.log('Result: ', result)
            expect(result.transaction_id).to.exist
        } catch (err) {
            console.log('Error: ', err)
            expect(err).to.equal(null)
        }
        await timeout(2000);
        try {
          const json = {
            json: true,
            code: 'fio.reqobt', 
            scope: 'fio.reqobt', 
            table: 'migrledgers', 
            limit: 10,               
            reverse: false,         
            show_payer: false  
          }
          ledger = await callFioApi("get_table_rows", json);
          isFinished = ledger.rows[0].isFinished
          //console.log('isFinished: ', isFinished);
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      }
    })

    it('Echo final migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt', 
          scope: 'fio.reqobt', 
          table: 'migrledgers', 
          limit: 10,               
          reverse: false,         
          show_payer: false  
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

  describe.skip(`I. Go through recordobts (old table) and confirm each entry is in fiotrxtss (NEW table)`, () => {
    let obtCount = 0
    let obtRecords;

    it('Step through recordobts and confirm every entry is found on the new table.', async () => {
      let count = 0;

      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'recordobts',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: false,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        obts = await callFioApi("get_table_rows", json);
        obtCount = obts.rows.length;
        //console.log('obts: ', obts);
        console.log('Number of records in recordobts: ', obtCount);
        for (obt in obts.rows) {
          // Call get_table_rows from fiotrxtss (NEW table) and confirm request is in table
          try {
            const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fiotrxtss',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
            }
            newRequests = await callFioApi("get_table_rows", json);
            //console.log('requests: ', newRequests);
            for (newRequest in newRequests.rows) {
              if (newRequests.rows[newRequest].payer_fio_addr == obts.rows[obt].payer_fio_addr) {
                //console.log(count);
                //console.log('recordobts:')
                //console.log('id: ', obts.rows[obt].id);
                //console.log('payer_fio_addr: ', obts.rows[obt].payer_fio_addr); 
                //console.log('payee_fio_addr: ', obts.rows[obt].payee_fio_addr); 
                //console.log('fiotrxtss:')
                //console.log('id: ', newRequests.rows[newRequest].id);
                //console.log('fio_request_id: ', newRequests.rows[newRequest].fio_request_id);
                //console.log('payer_fio_addr: ', newRequests.rows[newRequest].payer_fio_addr); 
                //console.log('payee_fio_addr: ', newRequests.rows[newRequest].payee_fio_addr); 

                expect(obts.rows[obt].payer_fio_addr).to.equal(newRequests.rows[newRequest].payer_fio_addr);
                expect(obts.rows[obt].payee_fio_addr).to.equal(newRequests.rows[newRequest].payee_fio_addr);
                expect(obts.rows[obt].payer_key).to.equal(newRequests.rows[newRequest].payer_key);
                expect(obts.rows[obt].payee_key).to.equal(newRequests.rows[newRequest].payee_key);
                //expect(obts.rows[obt].time_stamp).to.equal(newRequests.rows[newRequest].init_time); //Time stamps different?
                //expect(newRequests.rows[newRequest].fio_request_id).to.equal(0);
                //expect(newRequests.rows[newRequest].fio_data_type).to.equal(4);
                break;
              }
            }
          } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
          }
          count++;
        }
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

  describe.skip(`J. Go through fioreqctxts (old table) and confirm each entry is in fiotrxtss (NEW table)`, () => {
    let reqCount = 0
    let reqs;

    it('Step through fioreqctxts and confirm every entry is found on the new table.', async () => {
      let count = 0;
      let currentReqStatus;

      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fioreqctxts',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: false,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        reqs = await callFioApi("get_table_rows", json);
        reqCount = reqs.rows.length;
        //console.log('reqs: ', reqs);
        console.log('Number of records in fioreqctxts: ', reqCount);
        for (req in reqs.rows) {
          // First, get the status of the request
          try {
            const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fioreqstss',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
            }
            fioReqSts = await callFioApi("get_table_rows", json);
            //console.log('fioReqSts: ', fioReqSts);
            currentReqStatus = 0; //Initialize to 0 since that will be the status in the new table if the record's fio_request_id is not found in fioreqstss
            for (fioReqStatus in fioReqSts.rows) {
              //console.log('reqs.rows[req].fio_request_id', reqs.rows[req].fio_request_id)
              //console.log('fioReqStatus: ', fioReqSts.rows[fioReqStatus]);
              //console.log ('currentReqStatus', fioReqSts.rows[fioReqStatus].status);
              if (fioReqSts.rows[fioReqStatus].fio_request_id == reqs.rows[req].fio_request_id) {
                currentReqStatus = fioReqSts.rows[fioReqStatus].status;
                //console.log('id: ', fioReqSts.rows[fioReqStatus].id);
                //console.log('fio_request_id: ', fioReqSts.rows[fioReqStatus].fio_request_id);
                //console.log('status: ', fioReqSts.rows[fioReqStatus].status);
                //console.log('payer_fio_addr: ', fioReqSts.rows[fioReqStatus].time_stamp); 
                expect(reqs.rows[req].fio_request_id).to.equal(fioReqSts.rows[fioReqStatus].fio_request_id);
                break;
              }
            }
          } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
          }

          // Next, all get_table_rows from fiotrxtss (NEW table) and confirm request is in table
          try {
            const json = {
              json: true,               // Get the response as json
              code: 'fio.reqobt',      // Contract that we target
              scope: 'fio.reqobt',         // Account that owns the data
              table: 'fiotrxtss',        // Table name
              limit: 1000,                // Maximum number of rows that we want to get
              reverse: false,           // Optional: Get reversed data
              show_payer: false          // Optional: Show ram payer
            }
            newRequests = await callFioApi("get_table_rows", json);
            //console.log('requests: ', newRequests);
            for (newRequest in newRequests.rows) {
              if (newRequests.rows[newRequest].fio_request_id == reqs.rows[req].fio_request_id) {
                //console.log(count);
                //console.log('fioreqctxts:')
                //console.log('fio_request_id: ', reqs.rows[req].fio_request_id);
                //console.log('payer_fio_addr: ', reqs.rows[req].payer_fio_addr); 
                //console.log('payee_fio_addr: ', reqs.rows[req].payee_fio_addr); 
                //console.log('fioreqstss:')
                //console.log('status (0 = not found): ', currentReqStatus);
                //console.log('fiotrxtss:')
                //console.log('id: ', newRequests.rows[newRequest].id);
                //console.log('fio_request_id: ', newRequests.rows[newRequest].fio_request_id);
                //console.log('payer_fio_addr: ', newRequests.rows[newRequest].payer_fio_addr); 
                //console.log('payee_fio_addr: ', newRequests.rows[newRequest].payee_fio_addr); 
                //console.log('fio_data_type: ', newRequests.rows[newRequest].fio_data_type); 

                expect(reqs.rows[req].payer_fio_addr).to.equal(newRequests.rows[newRequest].payer_fio_addr);
                expect(reqs.rows[req].payee_fio_addr).to.equal(newRequests.rows[newRequest].payee_fio_addr);
                expect(reqs.rows[req].payer_key).to.equal(newRequests.rows[newRequest].payer_key);
                expect(reqs.rows[req].payee_key).to.equal(newRequests.rows[newRequest].payee_key);
                //expect(reqs.rows[req].time_stamp).to.equal(newRequests.rows[newRequest].init_time); //Time stamps different?
                expect(reqs.rows[req].fio_request_id).to.equal(newRequests.rows[newRequest].fio_request_id);
                expect(newRequests.rows[newRequest].fio_data_type).to.equal(currentReqStatus);
                break;
              }
            }
          } catch (err) {
            console.log('Error', err);
            expect(err).to.equal(null);
          }
          count++;
        }
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })
})

describe.skip(`(Only works in environments with both tables. Need to update contract) Release delta (develop - migr2) - remove data from old tables (fioreqctxts, recordobts, fioreqstss)`, () => {
  let isFinished = 0

  it('Echo size of fioreqctxts table', async () => {
    try {
      const json = {
        json: true,
        code: 'fio.reqobt', 
        scope: 'fio.reqobt', 
        table: 'fioreqctxts', 
        limit: 1000,               
        reverse: false,         
        show_payer: false  
      }
      fioreqctxts = await callFioApi("get_table_rows", json);
      console.log('fioreqctxts: ', fioreqctxts.rows.length);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('Echo size of recordobts table', async () => {
    try {
      const json = {
        json: true,
        code: 'fio.reqobt', 
        scope: 'fio.reqobt', 
        table: 'recordobts', 
        limit: 1000,               
        reverse: false,         
        show_payer: false  
      }
      recordobts = await callFioApi("get_table_rows", json);
      console.log('recordobts: ', recordobts.rows.length);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('Echo size of fioreqstss table', async () => {
    try {
      const json = {
        json: true,
        code: 'fio.reqobt', 
        scope: 'fio.reqobt', 
        table: 'fioreqstss', 
        limit: 1000,               
        reverse: false,         
        show_payer: false  
      }
      fioreqstss = await callFioApi("get_table_rows", json);
      console.log('fioreqstss: ', fioreqstss.rows.length);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it(`Call migrtrx (bp1) with amount = 20 until (fioreqctxts, recordobts, fioreqstss) are empty`, async () => {
    let fioreqctxtsIsFinished = false, recordobtsIsFinished = false, fioreqstssIsFinished = false;
    while (!fioreqctxtsIsFinished || !recordobtsIsFinished || !fioreqstssIsFinished) {
      try {
          const result = await callFioApiSigned('push_transaction', {
              action: 'migrtrx',
              account: 'fio.reqobt',
              actor: bp1.account,
              privKey: bp1.privateKey,
              data: {
                  amount: 20,
                  actor: bp1.account
              }
          })
          //console.log('Result: ', result)
          expect(result.transaction_id).to.exist
      } catch (err) {
          console.log('Error: ', err)
          expect(err).to.equal(null)
      }
      await timeout(2000);
      try {
        const json = {
          json: true,
          code: 'fio.reqobt', 
          scope: 'fio.reqobt', 
          table: 'fioreqctxts', 
          limit: 1000,               
          reverse: false,         
          show_payer: false  
        }
        fioreqctxts = await callFioApi("get_table_rows", json);
        fioreqctxtsIsFinished = (fioreqctxts.rows.length == 0);
        //console.log('fioreqctxts: ', fioreqctxts)
        console.log('\nfioreqctxts table rows count: ', fioreqctxts.rows.length)
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
      try {
        const json = {
          json: true,
          code: 'fio.reqobt', 
          scope: 'fio.reqobt', 
          table: 'recordobts', 
          limit: 1000,               
          reverse: false,         
          show_payer: false  
        }
        recordobts = await callFioApi("get_table_rows", json);
        recordobtsIsFinished = (recordobts.rows.length == 0);
        //console.log('recordobts: ', recordobts)
        console.log('recordobts table rows count: ', recordobts.rows.length)
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
      try {
        const json = {
          json: true,
          code: 'fio.reqobt', 
          scope: 'fio.reqobt', 
          table: 'fioreqstss', 
          limit: 1000,               
          reverse: false,         
          show_payer: false  
        }
        fioreqstss = await callFioApi("get_table_rows", json);
        fioreqstssIsFinished = (fioreqstss.rows.length == 0);
        //console.log('fioreqstss: ', fioreqstss)
        console.log('fioreqstss table rows count: ', fioreqstss.rows.length)
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    }
  })

  it('Confirm fioreqctxts table is empty', async () => {
    try {
      const json = {
        json: true,
        code: 'fio.reqobt', 
        scope: 'fio.reqobt', 
        table: 'fioreqctxts', 
        limit: 10,               
        reverse: false,         
        show_payer: false  
      }
      fioreqctxts = await callFioApi("get_table_rows", json);
      console.log('fioreqctxts: ', fioreqctxts);
      expect(fioreqctxts.rows.length).to.equal(0);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('Confirm recordobts table is empty', async () => {
    try {
      const json = {
        json: true,
        code: 'fio.reqobt', 
        scope: 'fio.reqobt', 
        table: 'recordobts', 
        limit: 10,               
        reverse: false,         
        show_payer: false  
      }
      recordobts = await callFioApi("get_table_rows", json);
      console.log('recordobts: ', recordobts);
      expect(recordobts.rows.length).to.equal(0);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('Confirm fioreqstss table is empty', async () => {
    try {
      const json = {
        json: true,
        code: 'fio.reqobt', 
        scope: 'fio.reqobt', 
        table: 'fioreqstss', 
        limit: 10,               
        reverse: false,         
        show_payer: false  
      }
      fioreqstss = await callFioApi("get_table_rows", json);
      console.log('fioreqstss: ', fioreqstss);
      expect(fioreqstss.rows.length).to.equal(0);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

})

describe.skip(`Release echo (migr/final-rc1) - remove migrtrx action, remove references to old tables (fioreqctxts, recordobts, fioreqstss) `, () => {

  it(`Call migrtrx. Expect error: Unknown action migrtrx in contract fio.reqobt`, async () => {
    try {
        const result = await callFioApiSigned('push_transaction', {
            action: 'migrtrx',
            account: 'fio.reqobt',
            actor: bp1.account,
            privKey: bp1.privateKey,
            data: {
                amount: 20,
                actor: bp1.account
            }
        })
        console.log('Result: ', result);
        expect(result).to.equal(null);
    } catch (err) {
        //console.log('Error: ', err.message);
        expect(err.message).to.equal('Unknown action migrtrx in contract fio.reqobt')
    }
  })

  it('get_table_rows for fioreqctxts. Expect: Table fioreqctxts is not specified in the ABI', async () => {
    try {
      const json = {
        json: true,
        code: 'fio.reqobt', 
        scope: 'fio.reqobt', 
        table: 'fioreqctxts', 
        limit: 10,               
        reverse: false,         
        show_payer: false  
      }
      fioreqctxts = await callFioApi("get_table_rows", json);
      console.log('fioreqctxts: ', fioreqctxts);
      expect(result).to.equal(null)
    } catch (err) {
      //console.log('Error: ', err.error.error)
      expect(err.error.code).to.equal(500)
      expect(err.error.error.details[0].message).to.equal('Table fioreqctxts is not specified in the ABI')
    }
  })

  it('get_table_rows for recordobts. Expect: Table recordobts is not specified in the ABI', async () => {
    try {
      const json = {
        json: true,
        code: 'fio.reqobt', 
        scope: 'fio.reqobt', 
        table: 'recordobts', 
        limit: 10,               
        reverse: false,         
        show_payer: false  
      }
      recordobts = await callFioApi("get_table_rows", json);
      console.log('recordobts: ', recordobts);
      expect(recordobts.rows.length).to.equal(0);
    } catch (err) {
      //console.log('Error', err);
      expect(err.error.code).to.equal(500)
      expect(err.error.error.details[0].message).to.equal('Table recordobts is not specified in the ABI')
    }
  })

  it('get_table_rows for fioreqstss. Expect: Table fioreqstss is not specified in the ABI', async () => {
    try {
      const json = {
        json: true,
        code: 'fio.reqobt', 
        scope: 'fio.reqobt', 
        table: 'fioreqstss', 
        limit: 10,               
        reverse: false,         
        show_payer: false  
      }
      fioreqstss = await callFioApi("get_table_rows", json);
      console.log('fioreqstss: ', fioreqstss);
      expect(fioreqstss.rows.length).to.equal(0);
    } catch (err) {
      //console.log('Error', err);
      expect(err.error.code).to.equal(500)
      expect(err.error.error.details[0].message).to.equal('Table fioreqstss is not specified in the ABI')
    }
  })

})

describe.only(`Set up data for testing mainnet migration and time_stamp bug`, () => {
  let count = 10;

  describe(`A. Load Requests and OBTs`, () => {
    /**
     * If you set count = 10 you should get:
     *
     * 10 requests = (creates: 10 entries in fioreqctxts)
     * 10 requests + cancel = (creates: 10 entries in fioreqctxts, 10 entries in fioreqstss)
     * 10 requests + rejects = (creates: 10 entries in fioreqctxts, 10 entries in fioreqstss)
     * 10 requests + obtresponse = (creates: 10 entries in fioreqctxts, 10 entries in fioreqstss (the content for the response goes into the fioreqstss table))
     * 10 straight obt = (creates: 10 entries in recordobts)
     *
     * Total: 40 entries in fioreqctxts, 30 entries in fioreqstss, 10 entries in recordobts
     * 
     * 0 = requested (only request content field)
     * 1 = rejected (only request content field)
     * 2 = sent_to_blockchain (should have both content fields and time fields)
     * 3 = cancelled (only request content field)
     * 4 = straight obt (should have single obt content field and time)
     */

    let user1, user2, user3;
    let payment = 3000000000;
    let requestMemo = 'We are here';

    it(`Create users`, async () => {
      user1 = await newUser(faucet);
      user2 = await newUser(faucet);
      user3 = await newUser(faucet);

      //console.log('user1: ' + user1.account + ', ' + user1.privateKey + ', ' + user1.publicKey)
      //console.log('user2: ' + user2.account + ', ' + user2.privateKey + ', ' + user2.publicKey)
      //console.log('user3: ' + user3.account + ', ' + user3.privateKey + ', ' + user3.publicKey)
    })

    it(`${count}x - user1 requests funds from user2`, async () => {
      for (i = 0; i < count; i++) {
        try {
          const result = await user1.sdk.genericAction('requestFunds', {
            payerFioAddress: user2.address,
            payeeFioAddress: user1.address,
            payeeTokenPublicAddress: user1.address,
            amount: payment,
            chainCode: 'FIO',
            tokenCode: 'FIO',
            memo: requestMemo,
            maxFee: config.api.new_funds_request.fee,
            payerFioPublicKey: user2.publicKey,
            technologyProviderId: '',
            hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
            offlineUrl: ''
          })
          //console.log('Result: ', result)
          expect(result.status).to.equal('requested')
        } catch (err) {
          console.log('Error', err.json)
          expect(err).to.equal(null)
        }
      }
    })

    it(`${count}x - user2 requests funds from user1, user2 cancels requests`, async () => {
      let requestId;
      for (i = 0; i < count; i++) {
        try {
          const result = await user2.sdk.genericAction('requestFunds', {
            payerFioAddress: user1.address,
            payeeFioAddress: user2.address,
            payeeTokenPublicAddress: user2.address,
            amount: payment,
            chainCode: 'FIO',
            tokenCode: 'FIO',
            memo: requestMemo,
            maxFee: config.api.new_funds_request.fee,
            payerFioPublicKey: user1.publicKey,
            technologyProviderId: '',
            hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
            offlineUrl: ''
          })
          //console.log('Result: ', result)
          requestId = result.fio_request_id;
          expect(result.status).to.equal('requested')
        } catch (err) {
          console.log('Error', err)
          expect(err).to.equal(null)
        }

        try {
          const result = await user2.sdk.genericAction('pushTransaction', {
            action: 'cancelfndreq',
            account: 'fio.reqobt',
            data: {
              fio_request_id: requestId,
              max_fee: config.api.cancel_funds_request.fee,
              tpid: '',
              actor: user2.account
            }
          })
          //console.log('Result:', result)
          expect(result.status).to.equal('cancelled')
        } catch (err) {
          console.log('Error', err)
          expect(err).to.equal(null)
        }
      }
    })

    it(`${count}x - user3 requests funds from user2, user2 rejects request`, async () => {
      let requestId;
      for (i = 0; i < count; i++) {
        try {
          const result = await user3.sdk.genericAction('requestFunds', {
            payerFioAddress: user2.address,
            payeeFioAddress: user3.address,
            payeeTokenPublicAddress: user3.address,
            amount: payment,
            chainCode: 'FIO',
            tokenCode: 'FIO',
            memo: requestMemo,
            maxFee: config.api.new_funds_request.fee,
            payerFioPublicKey: user2.publicKey,
            technologyProviderId: '',
            hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
            offlineUrl: ''
          })
          //console.log('Result: ', result)
          requestId = result.fio_request_id;
          expect(result.status).to.equal('requested')
        } catch (err) {
          console.log('Error', err)
          expect(err).to.equal(null)
        }

        try {
          const result = await user2.sdk.genericAction('pushTransaction', {
            action: 'rejectfndreq',
            account: 'fio.reqobt',
            data: {
              fio_request_id: requestId,
              max_fee: config.api.cancel_funds_request.fee,
              tpid: '',
              actor: user2.account
            }
          })
          //console.log('Result:', result)
          expect(result.status).to.equal('request_rejected')
        } catch (err) {
          console.log('Error', err)
          expect(err).to.equal(null)
        }
      }
    })

    it(`${count}x - user2 requests funds from user1, user 1 records OBT response`, async () => {
      let requestId;
      for (i = 0; i < count; i++) {
        try {
          const result = await user2.sdk.genericAction('requestFunds', {
            payerFioAddress: user1.address,
            payeeFioAddress: user2.address,
            payeeTokenPublicAddress: user2.address,
            amount: payment,
            chainCode: 'FIO',
            tokenCode: 'FIO',
            memo: requestMemo,
            maxFee: config.api.new_funds_request.fee,
            payerFioPublicKey: user1.publicKey,
            technologyProviderId: ''
          })
          //console.log('Result: ', result)
          requestId = result.fio_request_id;
          //console.log('requestId: ', requestId)
          expect(result.status).to.equal('requested')
        } catch (err) {
          console.log('Error', err.json)
          expect(err).to.equal(null)
        }

        try {
          const result = await user1.sdk.genericAction('recordObtData', {
            fioRequestId: requestId,
            payerFioAddress: user1.address,
            payeeFioAddress: user2.address,
            payerTokenPublicAddress: user1.publicKey,
            payeeTokenPublicAddress: user2.publicKey,
            amount: payment,
            chainCode: "FIO",
            tokenCode: "FIO",
            status: '',
            obtId: '',
            maxFee: config.api.record_obt_data.fee,
            technologyProviderId: '',
            payeeFioPublicKey: user2.publicKey,
            memo: 'this is a test'
          })
          //console.log('Result: ', result)
          expect(result.status).to.equal('sent_to_blockchain')
        } catch (err) {
          console.log('Error', err.json)
          expect(err).to.equal(null)
        }
      }
    })

    it(`${count}x user3 creates BTC OBT send record to user1`, async () => {
      for (i = 0; i < count; i++) {
        try {
          const result = await user3.sdk.genericAction('recordObtData', {
            fioRequestId: '',
            payerFioAddress: user3.address,
            payeeFioAddress: user1.address,
            payerTokenPublicAddress: user3.publicKey,
            payeeTokenPublicAddress: user1.publicKey,
            amount: payment,
            chainCode: "BTC",
            tokenCode: "BTC",
            status: '',
            obtId: '',
            maxFee: config.api.record_obt_data.fee,
            technologyProviderId: '',
            payeeFioPublicKey: user1.publicKey,
            memo: 'this is a test',
            hash: '',
            offLineUrl: ''
          })
          //console.log('Result: ', result)
          expect(result.status).to.equal('sent_to_blockchain')
        } catch (err) {
          console.log('Error', err.json)
          expect(err).to.equal(null)
        }
      }
    })

    it('Echo migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'migrledgers',
          limit: 10,
          reverse: false,
          show_payer: false
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })
  })

  describe(`B. Perform single migrtrx to initialize migration`, () => {

    it(`Call single migrtrx (bp1) and confirm you can still do Requests and OBTs`, async () => {
      try {
        const result = await callFioApiSigned('push_transaction', {
          action: 'migrtrx',
          account: 'fio.reqobt',
          actor: bp1.account,
          privKey: bp1.privateKey,
          data: {
            amount: 1,
            actor: bp1.account
          }
        })
        //console.log('Result: ', result)
        expect(result.transaction_id).to.exist
      } catch (err) {
        console.log('Error: ', err)
        expect(err).to.equal(null)
      }
    })

    it.skip('Call get_table_rows from fiotrxtss (NEW table) and display', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fiotrxtss',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: false,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        requests = await callFioApi("get_table_rows", json);
        console.log('requests: ', requests);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it('Echo migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'migrledgers',
          limit: 10,
          reverse: false,
          show_payer: false
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })
  })

  describe(`C. Initial OBT record. Confirm new OBT Sends are going into both tables`, () => {
    let user1, user2, user3
    let payment = 3000000000;

    it(`Create users`, async () => {
      user1 = await newUser(faucet);
      user2 = await newUser(faucet);
      user3 = await newUser(faucet);

      //console.log('user1: ' + user1.account + ', ' + user1.privateKey + ', ' + user1.publicKey)
      //console.log('user2: ' + user2.account + ', ' + user2.privateKey + ', ' + user2.publicKey)
      //console.log('user3: ' + user3.account + ', ' + user3.privateKey + ', ' + user3.publicKey)
    })


    it(`user3 creates BTC OBT send record to user1`, async () => {
      try {
        const result = await user3.sdk.genericAction('recordObtData', {
          fioRequestId: '',
          payerFioAddress: user3.address,
          payeeFioAddress: user1.address,
          payerTokenPublicAddress: user3.publicKey,
          payeeTokenPublicAddress: user1.publicKey,
          amount: payment,
          chainCode: "BTC",
          tokenCode: "BTC",
          status: '',
          obtId: '',
          maxFee: config.api.record_obt_data.fee,
          technologyProviderId: '',
          payeeFioPublicKey: user1.publicKey,
          memo: 'this is a test',
          hash: '',
          offLineUrl: ''
        })
        //console.log('Result: ', result)
        expect(result.status).to.equal('sent_to_blockchain')
      } catch (err) {
        console.log('Error', err.json)
        expect(err).to.equal(null)
      }
    })

    it('Call get_table_rows from recordobts (old table) and confirm OBT is in table', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'recordobts',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        obts = await callFioApi("get_table_rows", json);
        //console.log('obts: ', obts);
        for (request in obts.rows) {
          if (obts.rows[request].payer_fio_addr == user3.address) {
            //console.log('payer_fio_addr: ', obts.rows[request].payer_fio_addr); 
            break;
          }
        }
        expect(obts.rows[request].payer_fio_addr).to.equal(user3.address);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it('Call get_table_rows from fiotrxtss (NEW table) and confirm request is in table', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fiotrxtss',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        requests = await callFioApi("get_table_rows", json);
        //console.log('requests: ', requests);
        for (request in requests.rows) {
          if (requests.rows[request].payer_fio_addr == user3.address) {
            //console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
            break;
          }
        }
        expect(requests.rows[request].payer_fio_addr).to.equal(user3.address);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it('Echo migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'migrledgers',
          limit: 10,
          reverse: false,
          show_payer: false
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

  describe(`D. Initial FIO Request record. Confirm NEW Requests are going into both tables`, () => {
    let user1, user2, user3, requestId, obtId
    let payment = 3000000000;
    let requestMemo = 'asdf';

    it(`Create users`, async () => {
      user1 = await newUser(faucet);
      user2 = await newUser(faucet);
      user3 = await newUser(faucet);

      //console.log('user1: ' + user1.account + ', ' + user1.privateKey + ', ' + user1.publicKey)
      //console.log('user2: ' + user2.account + ', ' + user2.privateKey + ', ' + user2.publicKey)
      //console.log('user3: ' + user3.account + ', ' + user3.privateKey + ', ' + user3.publicKey)
    })

    it(`user1 requests funds from user2`, async () => {
      try {
        const result = await user1.sdk.genericAction('requestFunds', {
          payerFioAddress: user2.address,
          payeeFioAddress: user1.address,
          payeeTokenPublicAddress: user1.address,
          amount: payment,
          chainCode: 'FIO',
          tokenCode: 'FIO',
          memo: requestMemo,
          maxFee: config.api.new_funds_request.fee,
          payerFioPublicKey: user2.publicKey,
          technologyProviderId: '',
          hash: 'fmwazjvmenfz',  // This is the hash of off-chain data... ?
          offlineUrl: ''
        })
        //console.log('Result: ', result)
        requestId = result.fio_request_id;
        expect(result.status).to.equal('requested')
      } catch (err) {
        console.log('Error', err.json)
        expect(err).to.equal(null)
      }
    })

    it('Requests: Call get_table_rows from fioreqctxts (old table) and confirm request is in table', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fioreqctxts',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        requests = await callFioApi("get_table_rows", json);
        //console.log('requests: ', requests);
        for (request in requests.rows) {
          if (requests.rows[request].fio_request_id == requestId) {
            //console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
            break;
          }
        }
        expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it('Call get_table_rows from fiotrxtss (NEW table) and confirm request is in table', async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fiotrxtss',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        requests = await callFioApi("get_table_rows", json);
        //console.log('requests: ', requests);
        for (request in requests.rows) {
          if (requests.rows[request].fio_request_id == requestId) {
            //console.log('payer_fio_addr: ', requests.rows[request].payer_fio_addr); 
            break;
          }
        }
        expect(requests.rows[request].payer_fio_addr).to.equal(user2.address);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it('Echo migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'migrledgers',
          limit: 10,
          reverse: false,
          show_payer: false
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

  describe(`E. Migrate currentobt and currentrq, but only migrate partial currentsta`, () => {0

    it('Echo migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'migrledgers',
          limit: 10,
          reverse: false,
          show_payer: false
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it(`Call migrtrx (bp1) ${count * 6 / 10} times with amount = 10. Should leave somre remaining fioreqstss items.`, async () => {
      for (i = 0; i < count * 6 / 10; i++) { // count*6/10
        try {
          const result = await callFioApiSigned('push_transaction', {
            action: 'migrtrx',
            account: 'fio.reqobt',
            actor: bp1.account,
            privKey: bp1.privateKey,
            data: {
              amount: 10,
              actor: bp1.account
            }
          })
          //console.log('Result: ', result)
          expect(result.transaction_id).to.exist
        } catch (err) {
          console.log('Error: ', err)
          expect(err).to.equal(null)
        }
        await timeout(2000);
        try {
          const json = {
            json: true,
            code: 'fio.reqobt',
            scope: 'fio.reqobt',
            table: 'migrledgers',
            limit: 10,
            reverse: false,
            show_payer: false
          }
          ledger = await callFioApi("get_table_rows", json);
          //console.log('isFinished: ', isFinished);
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      }
    })

    it('Echo final migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'migrledgers',
          limit: 10,
          reverse: false,
          show_payer: false
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

  describe(`F. Migrate ALL remaining requests and OBTs`, () => {
    /**
     * If you set count = 10 above you should get:
     *
     * Total: 50 total entries in fiotrxtss
     */

    let isFinished = 0

    it('Echo initial migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'migrledgers',
          limit: 10,
          reverse: false,
          show_payer: false
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it(`Call migrtrx (bp1) with amount = 3 until migrledgers isFinished = 1`, async () => {
      while (!isFinished) {
        try {
          const result = await callFioApiSigned('push_transaction', {
            action: 'migrtrx',
            account: 'fio.reqobt',
            actor: bp1.account,
            privKey: bp1.privateKey,
            data: {
              amount: 3,
              actor: bp1.account
            }
          })
          //console.log('Result: ', result)
          expect(result.transaction_id).to.exist
        } catch (err) {
          console.log('Error: ', err)
          expect(err).to.equal(null)
        }
        await timeout(2000);
        try {
          const json = {
            json: true,
            code: 'fio.reqobt',
            scope: 'fio.reqobt',
            table: 'migrledgers',
            limit: 10,
            reverse: false,
            show_payer: false
          }
          ledger = await callFioApi("get_table_rows", json);
          isFinished = ledger.rows[0].isFinished
          //console.log('isFinished: ', isFinished);
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      }
    })

    it('Echo migrledgers table', async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'migrledgers',
          limit: 10,
          reverse: false,
          show_payer: false
        }
        ledger = await callFioApi("get_table_rows", json);
        console.log('migrledgers: ', ledger);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

  describe.skip(`G. Confirm table counts`, () => {

    it(`Call get_table_rows from fioreqctxts: expect ${count} * 4 + 1  records`, async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'fioreqctxts', 
          limit: 1000,
          reverse: true,
          show_payer: false
        }
        reqctxts = await callFioApi("get_table_rows", json);
        expect(reqctxts.rows.length).to.equal(count * 4 + 1);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it(`Call get_table_rows from fioreqstss: expect ${count} * 3 records`, async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'fioreqstss',
          limit: 1000,
          reverse: true,
          show_payer: false
        }
        obts = await callFioApi("get_table_rows", json);
        expect(obts.rows.length).to.equal(count * 3);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it(`Call get_table_rows from recordobts: expect ${count} * 1 + 1 records`, async () => {
      try {
        const json = {
          json: true,
          code: 'fio.reqobt',
          scope: 'fio.reqobt',
          table: 'recordobts',
          limit: 1000,
          reverse: true,
          show_payer: false
        }
        obts = await callFioApi("get_table_rows", json);
        expect(obts.rows.length).to.equal(count * 1 + 1);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

    it(`Call get_table_rows from fiotrxtss: expect ${count} * 5 + 2 records`, async () => {
      try {
        const json = {
          json: true,               // Get the response as json
          code: 'fio.reqobt',      // Contract that we target
          scope: 'fio.reqobt',         // Account that owns the data
          table: 'fiotrxtss',        // Table name
          limit: 1000,                // Maximum number of rows that we want to get
          reverse: true,           // Optional: Get reversed data
          show_payer: false          // Optional: Show ram payer
        }
        trxtss = await callFioApi("get_table_rows", json);
        expect(trxtss.rows.length).to.equal(count * 5 + 2);
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
      }
    })

  })

})

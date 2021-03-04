require('mocha')
const {expect} = require('chai')
const {newUser, fetchJson, timeout, getTestType, callFioApi, callFioApiSigned} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/fiosdk')
config = require('../config.js');
const testType = getTestType();
const Eth = require('web3-eth');

const ERC20FioWrapABI =  [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name_",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol_",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "addedValue",
        "type": "uint256"
      }
    ],
    "name": "increaseAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "subtractedValue",
        "type": "uint256"
      }
    ],
    "name": "decreaseAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const Web3 = require('web3');
let web3 = new Web3(Web3.givenProvider || 'ws://127.0.0.1:7545'); //ws://50.250.156.58:18546

//const contractAddress = '0x409F0d72e4700884200df4B11394b10A3539EB94'
//const tokenContract = new web3.eth.Contract(ERC20FioWrapABI, contractAddress)


before(async () => {
  faucet = new FIOSDK(config.FAUCET_PRIV_KEY, config.FAUCET_PUB_KEY, config.BASE_URL, fetchJson);
})

describe('************************** wrapping.js ************************** \n    A. Wrap FIO. Confirm creation of ETH approve.', () => {

    let user1
    const maxOracleFee = 1000000000,
        amount = 123000000000,  //100 FIO
        chainCode = 'ETH',
        publicAddress = '0x3BDAfc1a2d47e24dA5F9740AEA919F35F8186eA3',
        publicAddressno0x = '3BDAfc1a2d47e24dA5F9740AEA919F35F8186eA3',
        hex = 'dc5fceb668d810b04cfcf45ee0941a4b'  //remove the 0x

    it(`Create users`, async () => {
        user1 = await newUser(faucet);

        console.log('user1 account: ', user1.account)
        console.log('user1 priv: ', user1.privateKey)
        console.log('user1 pub: ', user1.publicKey)
        
    })

    it.only(`byte test`, async () => {
      const buf6 = Buffer.from('tést');
      const buf = Buffer.from('dc5fceb668d810b04cfcf45ee0941a4b');
      console.log('buf: ', buf)
      console.log('buflen: ', Buffer.byteLength(hex))

      const bufeth = Buffer.from(publicAddressno0x);
      console.log('bufeth: ', bufeth)
      console.log('bufethlength: ', Buffer.byteLength(publicAddressno0x));
      

      //const bufhex = Buffer.from('dc5fceb668d810b04cfcf45ee0941a4b', 'hex');
      //console.log('bufhex: ', bufhex)
  })

    it(`eth test`, async () => {
        let acct = await web3.eth.getAccounts();
        console.log('acct: ', acct);

        //console.log('balance: ', await web3.eth.balanceOf(publicAddress));
        //console.log('Provider: ', await web3.eth.currentProvider);
       // web3.eth.getProtocolVersion().then(console.log);


       //balance = await testContract.methods.balanceOf(publicAddress);
       //console.log('balance: ', balance._method)

       //var decimal = tokenContract.decimals()
       console.log('balance: ', tokenContract.balanceOf(publicAddress))
       //var balance = tokenContract.balanceOf(address)
       //var adjustedBalance = balance / Math.pow(10, decimal)
       //var tokenName = tokenContract.name()
       //var tokenSymbol = tokenContract.symbol()
    })

    it('Echo oracleldgrs table', async () => {
        try {
          const json = {
            json: true,
            code: 'fio.oracle', 
            scope: 'fio.oracle', 
            table: 'oracleldgrs', 
            limit: 10,               
            reverse: false,         
            show_payer: false  
          }
          result = await callFioApi("get_table_rows", json);
          console.log('oracleldgrs: ', result);
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
                amount: amount,
                chain_code: chainCode,
                public_address: publicAddress,
                max_oracle_fee: maxOracleFee,
                max_fee: config.maxFee,
                tpid: '',
                actor: user1.account
            }
          })
          console.log('Result: ', result)
          //expect(result.processed.receipt.status).to.equal('executed');
        } catch (err) {
          console.log('Error', err);
          expect(err).to.equal(null);
        }
      })

      it('Echo oracleldgrs table', async () => {
        try {
          const json = {
            json: true,
            code: 'fio.oracle', 
            scope: 'fio.oracle', 
            table: 'oracleldgrs', 
            limit: 10,               
            reverse: false,         
            show_payer: false  
          }
          result = await callFioApi("get_table_rows", json);
          console.log('oracleldgrs: ', result);
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
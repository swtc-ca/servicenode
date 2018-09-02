var axios = require('axios');
var moment = require('moment');
var helper = require('./helper.js');

var SYNCED = false;
var ACCOUNTS = [];
var WALLETS_ACCOUNT = [];
var WALLETS = [];
var TIMEOUT = 0;
const ADDRESS_COUNT = 40;
const WALLET_ROOT = helper.WALLET_ROOT;
const LOGFILE = moment().format('MMDDHHmm');
var write_file = helper.writeStream(`${LOGFILE}.txt`);

test_block = { 
	hash: '18ED02D8BE1917D65E81CB27B5289E5957C93D4C448357FF598FAB0468684A36',
	number: 263102
}

// check if ledgers are synced or not
target_sync = {method: 'jt_syncing', params: []};
console.log(`request method: ${target_sync.method}`);
helper.swtNodeRequest(helper.rpcSwtNodeParam({method: target_sync.method, params: target_sync.params}))
	.then( response => {
			if ( response.data.status == 'success' ) {
				SYNCED = true;
				console.log(`... ${target_sync.method} works`);
			} else {
				console.warn(`!!! sync status?`)
			}
	})
	.catch( error => { console.warn(`!!! ${target_sync.method} error`)})

// make sure we have 100 wallets for test and activated
try {
	WALLETS = JSON.parse(helper.readFile('wallets.txt'));
	if (WALLETS.length < ADDRESS_COUNT) {
		while ( WALLETS.length < ADDRESS_COUNT ) { WALLETS.push(helper.newWallet()); }
		helper.writeFile('wallets.txt',JSON.stringify(WALLETS));
	}
} catch (e) {
	while ( WALLETS.length < ADDRESS_COUNT ) { WALLETS.push(helper.newWallet()); }
	helper.writeFile('wallets.txt',JSON.stringify(WALLETS));
}
WALLETS.forEach( wallet => { TIMEOUT += 2000; setTimeout( () => activateWallet(wallet, 30000000), TIMEOUT) });

// make sure your have generated local accounts including the root account
target_accounts = {method: 'jt_accounts', params: []};
console.log(`request method: ${target_accounts.method}`);
helper.swtNodeRequest(helper.rpcSwtNodeParam({method: target_accounts.method, params: target_accounts.params}))
		.then(
			response => {
				console.log(`... ${target_accounts.method} works`);
				ACCOUNTS = response.data.result;
				tryMethods(targets);
				// exclude the root account
				if ( ACCOUNTS.indexOf(WALLET_ROOT.address) !== -1 && SYNCED ) {
					console.log("\t... good root wallet is there, let's do performance test");
					ACCOUNTS.splice(ACCOUNTS.indexOf(WALLET_ROOT.address),1);
					targets2 = []
					// make sure local accounts are activated
					for ( let account of ACCOUNTS ) {
						WALLETS_ACCOUNT.push({address: account});
					}
					WALLETS_ACCOUNT.forEach( wallet => { TIMEOUT += 2000; setTimeout( () => activateWallet(wallet, 100000000), TIMEOUT) });
					params_transaction = [{from: WALLET_ROOT.address, to: ACCOUNTS[0], value: "30"}];
					targets2.push({ method:'jt_signTransaction', params: params_transaction});
					targets2.push({ method: 'jt_sendTransaction', params: params_transaction });
					tryMethods(targets2);
				} else {
					console.warn("\t!!! make sure synced and add root wallet to your service node account to do performance test");
					console.log(WALLET_ROOT);
				}
			}
		)
		.catch( error => { console.warn(`!!! ${target_accounts.method} error`)})

//setTimeout( () => helper.readStream(`${LOGFILE}.txt`), 2000)
setInterval( () => startStress() , 10000)

function startStress() {
	console.log(`... check if we can start generating transactions or not`);
	filter_activated = (element) => element.hasOwnProperty('activated');
	WALLETS_ACCOUNT.filter(filter_activated).length > 10 || console.log("please prepare more accouns")
	WALLETS.filter(filter_activated).length > 10 || console.log("please prepare more wallets")
}























































//ws.end()
targets =  [
	{  method: 'jt_blockNumber', params: []},
	{  method: 'jt_getBalance', params: [WALLET_ROOT.address, 'validated']},
	{  method: 'jt_getBlockByHash', params: [ test_block.hash, true]},
	{  method: 'jt_getBlockByNumber', params: [ `${test_block.number}`, true]},
	{ log: true, method: 'jt_getTransactionCount', params: [WALLET_ROOT.address, 'validated']},
	{ log: true, method: 'jt_getBlockTransactionCountByHash', params: [test_block.hash]},
	{ log: true, method: 'jt_getBlockTransactionCountByNumber', params: [`${test_block.number}`]},
	//{ log: true, method: 'jt_accounts', params: []},
	//jt_getTransactionByHash
	//jt_getTransactionByBlockHashAndIndex
	//jt_getTransactionByBlockNumberAndIndex
	{ method: 'jt_getTransactionReceipt', params: ['CC903C5B2E96D93C950B07EAB9F45E041400FDB86070D7BBF799A7CB0AC0F0E7'] },
	{ log: true, method:'jt_sign', params: ['jEwQbrKbSVgVkptbdv5vPmJKDFqmS2ehfW','0xdeadbeaf']},
];

function tryMethods(targets) {
	for ( let target of targets ) {
		console.log(`   ...request method: ${target.method}`)
		tryMethod(target)
	}
}

async function tryMethod(target) {
	try {
		let response = await helper.swtNodeRequest(helper.rpcSwtNodeParam({method: target.method, params: target.params}))
		console.log(`   ... ${target.method} works`);
		if ( target.log ) {console.log(response.data.result)} 
		write_file.write(helper.castString(response.data.result))
	} catch( error ) {
		 console.warn(`   !!! ${target.method} error`)
	}
}

async function getBalance(address) {
	try {
		let response = await helper.swtNodeRequest(helper.rpcSwtNodeParam({method: 'jt_getBalance', params: [address, 'validated']})) ;
		console.log(`   ... ${address} has balance ${parseInt(response.data.result.balance)}`);
	} catch( error ) {
		console.warn(`   !!! got error`);
	}
}

var TRANSACTION_LIST = []
async function activateAccount(account, amount) {
	try {
		let response = await helper.swtNodeRequest(helper.rpcSwtNodeParam({method: 'jt_getBalance', params: [account, 'validated']}));
		result = response.data.result;
		if (parseInt(result.balance) >= amount) {
			console.log(`...${account} balance ${result.balance} already activated`);
		} else {
			console.log(`... activating ${account}`);
			TRANSACTION_LIST.push(account);
			tryMethod({method: 'jt_sendTransaction', params: [{from: WALLET_ROOT.address, to: account, value: `${amount}`}]});
		}
	} catch( error ) {
		 console.warn(`!!! activation ${error}`)
	}
}
async function activateWallet(wallet, amount) {
	try {
		let response = await helper.swtNodeRequest(helper.rpcSwtNodeParam({method: 'jt_getBalance', params: [wallet.address, 'validated']}));
		result = response.data.result;
		if (parseInt(result.balance) >= amount) {
			console.log(`...${wallet.address} balance ${result.balance} already activated`);
			wallet.activated = true
		} else {
			console.log(`... activating ${wallet.address}`);
			TRANSACTION_LIST.push(wallet.address);
			tryMethod({method: 'jt_sendTransaction', params: [{from: WALLET_ROOT.address, to: wallet.address, value: `${amount}`}]});
			//setTimeout( () => tryMethod({method: 'jt_sendTransaction', params: [{from: WALLET_ROOT.address, to: wallet.address, value: `${amount}`}]}), Math.random() * 10000);
		}
	} catch( error ) {
		 console.warn(`!!! activation ${error}`)
	}
}

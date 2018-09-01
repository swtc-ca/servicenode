var jlib = require('jingtum-lib');
var fs = require('fs');
var Wallet = jlib.Wallet;
var axios = require('axios');

const WALLET_ROOT = {
	address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
};

function rpcSwtNodeParam(obj) {
	obj.hasOwnProperty('jsonrpc') || ( obj.jsonrpc = '2.0' );
	obj.hasOwnProperty('params') || ( obj.params = [] );
	obj.hasOwnProperty('id') || ( obj.id = (new Date()).getTime() * 100000 + Math.floor(Math.random() * 100000) );
	//obj.hasOwnProperty('version') || ( obj.version = 'v1' );
	return obj
}

function swtNodeRequest(param, url) {
	if (!url) return axios.post('http://127.0.0.1:7545/v1/jsonrpc', rpcSwtNodeParam(param))
	return axios.post(url, rpcSwtNodeParam(param))
}

function writeStream(file) {
	return fs.createWriteStream(file, 'utf-8')
}

function castString(target) {
	if (typeof(target) === 'object') { return `${JSON.stringify(target,null,'\t')}\n` }
	else if (typeof(target) === 'number') { return `${target}\n` }
	else if (typeof(target) === 'string') { return `${target}\n` }
	else { return `${typeof(target)}\n` }
}

function readFile(file) {
	return fs.readFileSync(file,'utf-8');
}

function writeFile(file, data) {
	return fs.writeFileSync(file, data);
}

function statFile(file) {
	return fs.statSync(file);
}

function generateWallet() {
	return Wallet.generate();
}

function testGenerateWallet() {
	w = generateWallet();
	console.log(w);
}

function readStream(file) {
	var rs = fs.createReadStream(file, 'utf-8');

	rs.on('data', function (chunk) {
		chunk.trim().split('\n').forEach( line => console.log(`\t......${line}`));
	});
	rs.on('end', function () {
		console.log('\t......');
	});
	rs.on('error', function (err) {
		console.log('\t!!!!!! ' + err);
	});
	return rs;
}

module.exports = {
	WALLET_ROOT,
	readFile,
	writeFile,
	statFile,
	readStream,
	writeStream,
	newWallet: generateWallet,
	rpcSwtNodeParam,
	swtNodeRequest,
	castString,
}

//async function signMessage(msg, PRIVATE_KEY) {
//  return await secp.sign(msg, PRIVATE_KEY, {recovered: true})
//}

const secp = require('ethereum-cryptography/secp256k1');
const { toHex, utf8ToBytes } = require('ethereum-cryptography/utils');
const { keccak256 } = require("ethereum-cryptography/keccak");

function hashMessage(message) {
  return keccak256(utf8ToBytes(message))
}

//[sig, recoveryBit] = secp.sign(hashMessage(message), privateKey, {recovered: true})

const privateKey = secp.utils.randomPrivateKey();

//const recovered = secp.recoverPublicKey(hashMessage(msg), sig, recoveryBit);

console.log('private key', toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);

console.log('public key', toHex(publicKey));

async function signMessage() {
  const signature = await secp.sign(hashMessage('hello world'), privateKey, {recovered: true});
  console.log('signature', signature);
  const [sig, recoveryBit] = signature;
  const x = secp.recoverPublicKey(hashMessage('hello world'), sig, recoveryBit)
  console.log(toHex(x))
}
 
signMessage()

//async function recoverKey(message, signature, recoveryBit) {
//  return secp.recoverPublicKey(hashMessage(message), signature, recoveryBit)
//  console.log('recovered', recovered)
//}

//const recovered = secp.recoverPublicKey(utf8ToBytes('hello world'), sig)

//recoverKey('hello world')

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require('ethereum-cryptography/utils');

app.use(cors());
app.use(express.json());

const balances = {
  "04b75c11a85b526c3c48f7b19c15ed830465657bef2245a9c2ab18d0caf76546dbae5962b6fd5cfc7fa7e6e987d48b0fef4f743835465ffc57965df638c9b15e24": 100,
  "04b14db83e5e372752ee11fac3eae441f0edfa434306b0cd6cf903807fada6414c466eb7d38a4783bc2bb2c1c0fdbd81812ce140669609988a5630526614deeed1": 50,
  "04bf5ffcc0bbc0458f30110fc8f60a48ec5299e4b214cb062a9fb09a99e1a88157c74af0fc6a7e62a7a815cdccd97676b148ee054ba85f532d398ddc203693ccb4": 75,
};

// mapping of public to private keys
const public_to_private = {
  "04b75c11a85b526c3c48f7b19c15ed830465657bef2245a9c2ab18d0caf76546dbae5962b6fd5cfc7fa7e6e987d48b0fef4f743835465ffc57965df638c9b15e24":"ffd9fed21e3511cbee98b88ea78ae602e6f8aaedbce520c2e84f74e163a2772b",
  "04b14db83e5e372752ee11fac3eae441f0edfa434306b0cd6cf903807fada6414c466eb7d38a4783bc2bb2c1c0fdbd81812ce140669609988a5630526614deeed1":"78db4dce92a71022c278168e5ff2bd4a1495fae668400853b629c97a7b55339c",
  "04bf5ffcc0bbc0458f30110fc8f60a48ec5299e4b214cb062a9fb09a99e1a88157c74af0fc6a7e62a7a815cdccd97676b148ee054ba85f532d398ddc203693ccb4":"e82b94e6fe3cda3c7dbfb8efab7f58d2b61e193a984dea7bdfefa2cf68d22d26"
}

// message for signing
const message = "hello world"

app.get("/balance/:address", async (req, res) => {
  const { address } = req.params;

  // get private key from mapping
  const privateKey = public_to_private[address]

  // sign with private key
  const [signature, recoveryBit] = await secp.sign(keccak256(utf8ToBytes(message)), public_to_private[address], {recovered: true})

  const balance = balances[address] || 0;

  // stringify signature for json response
  res.send({ balance, signature: JSON.stringify(signature), recoveryBit});
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, recoveryBit } = req.body;

  // get original signature array from stringified signature
  signatureArray = Object.values(JSON.parse(signature))

  // convert signature array back to signature
  const updated_signature = Uint8Array.from(signatureArray);

  // recover public key
  const publicKey = toHex(secp.recoverPublicKey(keccak256(utf8ToBytes(message)), updated_signature, recoveryBit))

  // check if the sender has the same public key as the signature
  if (sender == publicKey) {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.status(400).send({ message: "signature does not match the key" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

const hex = (n) => Array.from({length:n},()=>Math.floor(Math.random()*16).toString(16)).join("");
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const b58 = (n) => Array.from({length:n},()=>B58[Math.floor(Math.random()*58)]).join("");

module.exports.generateWalletAddresses = () => ({
  btc:  "1FNV" + b58(30),
  eth:  "0x"   + hex(40),
  usdt: "T"    + b58(33),
  bnb:  "bnb1" + hex(38),
});

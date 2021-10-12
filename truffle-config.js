const path = require("path");
require('dotenv').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = process.env.MNEMONIC;
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    rinkeby:{
      provider: function() {
        return new HDWalletProvider(mnemonic, process.env.URL_INFURA);
      },
      network_id: '4',
      networkCheckTimeout: 999999,
    }
  },
  compilers: {
    solc:{
      versión: "^0.6.12"
    }
  }
};

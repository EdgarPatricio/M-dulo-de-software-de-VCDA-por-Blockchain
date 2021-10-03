const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "hover hospital firm humor ride fragile spoon deposit imitate riot action add";
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
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/85be715d2d394226b878e09c8e1e66ee");
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

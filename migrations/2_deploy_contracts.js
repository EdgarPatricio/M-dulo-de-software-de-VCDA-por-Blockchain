var StorageCAD = artifacts.require("./StorageCAD.sol");

module.exports = function(deployer) {
  deployer.deploy(StorageCAD);
};

const GoodTimes = artifacts.require("GoodTimesContract");

module.exports = function (deployer) {
  deployer.deploy(GoodTimes);
};

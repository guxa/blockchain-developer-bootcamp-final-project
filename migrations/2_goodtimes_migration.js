const GoodTimes = artifacts.require("GoodTimesContract");

module.exports = function (deployer) {
	const withdrawalThreshold = 50;
  deployer.deploy(GoodTimes, withdrawalThreshold);
};

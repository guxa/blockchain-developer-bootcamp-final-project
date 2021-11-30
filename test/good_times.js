const GoodTimes = artifacts.require("GoodTimesContract");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("GoodTimes", function ( accounts ) {
  it("should assert true", async function () {
    await GoodTimes.deployed();
    return assert.isTrue(true);
  });
  let  gtcCounter = 0;

  it("should have a valid value for withdrawThreshold", async function () {
	  const gtcInstance = await GoodTimes.deployed();
	  let thresholdValue = await gtcInstance.withdrawThreshold();
	
	  assert(thresholdValue > 0 && thresholdValue < 100, 
		"withdrawThreshold has invalid value! must be > 0 and < 100");
  })

  it("should create a new GoodTime with provided name", async function () {
	const gtcInstance = await GoodTimes.deployed();
	await gtcInstance.createGoodTimes("firstGtc", 3, {value: 500});
	let newGtc = await gtcInstance.goodTimesRegistry.call(1);
	assert.equal(newGtc.name, "firstGtc");
	gtcCounter++;
})

it("should store Value sent in budget", async function () {
	const gtcInstance = await GoodTimes.deployed();
	const gtcValue = 700;
	await gtcInstance.createGoodTimes("second", 3, {value: gtcValue});
	let newGtc = await gtcInstance.goodTimesRegistry.call(2);
	assert.equal(newGtc.budget, gtcValue);
})

describe("PledgeFunds function", async () => {
	const value = 2000;
	const gtcId = 2;
	let gtcInstance;

	beforeEach(async function () {
        gtcInstance = await GoodTimes.deployed();
    });
	
	it("should record entry in fundsPledgedByUser", async function () {
		// const gtcInstance = await GoodTimes.deployed();
		// let gtc2 = await gtcInstance.goodTimesRegistry.call(gtcId);
		
		await gtcInstance.pledgeFunds(gtcId, {from: accounts[2], value: value});
		const result = await gtcInstance.checkFundsPledgedByUser(gtcId, {from: accounts[2]});
		assert.equal(result, value, `pledged funds should be ${value} !`);
	});

	it("should increase GTC budget by pledged value", async function () {
		let gtc2 = await gtcInstance.goodTimesRegistry.call(gtcId);
		let initialBudget = gtc2.budget.toNumber();
		await gtcInstance.pledgeFunds(gtcId, {from: accounts[2], value: value});
		gtc2 = await gtcInstance.goodTimesRegistry.call(gtcId);
		let newBudget = gtc2.budget.toNumber();
		//console.log(web3.utils.isBN(gtc2.budget) + "alooooo ");
		assert.equal(newBudget, initialBudget + value);
	});

	it("should record gtc in goodTimesByUser mapping", async () => {
		let result = await gtcInstance.getUsersGTCs( {from: accounts[2]});
		result = result.map( elem => elem.toNumber());
		
		assert(result.includes(gtcId));
	})
});



// TODO :
// withdrawal failed because not Enough confirmations
// withdrawal failed because not participant
});

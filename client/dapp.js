const GTC_ABI_PATH = "../build/contracts/GoodTimesContract.json";
let goodTimesContract;
var web3;
let network;

window.addEventListener('load', onPageLoad);

async function onPageLoad()
{
	if (typeof window.ethereum !== 'undefined')
	{
		console.log("Metamask detected!");
		let mmDetected = document.getElementById('mm-detected');
		await ethereum.request({method: 'eth_requestAccounts'});
		mmDetected.innerHTML = "MetaMask detected, nice &#x1F98A;" +
			`<br> Your account: ${ethereum.selectedAddress}`;

		await configureBlockchainStuff();
		
		await checkConnection();
	}
	else
	{
		console.log("Metamask Not Available!");
		alert("You need to install MetaMask to use this Dapp !");
	}
}


async function configureBlockchainStuff(){
	var json = await $.getJSON(GTC_ABI_PATH);
	let abi = json.abi;	
	web3 = new Web3(window.ethereum);

	const contractAddress = json.networks[await web3.eth.net.getId()].address;
	goodTimesContract = new web3.eth.Contract(abi, contractAddress);
	await goodTimesContract.setProvider(window.ethereum);
	window.addEventListener('click', checkConnection);
	// web3.eth.handleRevert = true;
}

/* Web3 Utility Functions */

async function checkConnection() {
	web3.eth.net.isListening()
	.then(async (s) => {
		network = await web3.eth.net.getNetworkType();
		document.getElementById("conn-status").innerHTML = 
			"Connected to the blockchain node! " + "<b>network: " + network +"</b>";
		console.log('We\'re connected to the node');
	})
	.catch((e) => {
		document.getElementById("conn-status").innerHTML = "<b>NO connection to the blockchain node !</b>";
		console.log('No connection to the node !');		
	});
}


function parseWeb3Error(error) {
	if (network === "private") {
		var errMessage = JSON.parse(error.message.substring(49, error.message.length - 1)); //.trim()
		errMessage =  errMessage.value.data.message;
		let removeGenericMessage = errMessage.split("VM Exception while processing transaction:");
		errMessage = removeGenericMessage.length > 1 ? removeGenericMessage[1] : removeGenericMessage[0];
		return errMessage;
	}
	else if (network === "ropsten") {
		return `see details at: <a href="https://ropsten.etherscan.io/tx/${error.receipt.transactionHash}"`
		+ ' target="_blank"> ropsten.etherscan.io </a>'
	}
}

// const mmEnable = document.getElementById('mm-connect');

// mmEnable.onclick = async () => {
// 	console.log("someone clicked the button");
// 	await ethereum.request({method: 'eth_requestAccounts'});
// 	const currentAccount = document.getElementById('mm-current-account');
// 	currentAccount.innerHTML = "Your account is: " + ethereum.selectedAddress;	
// }
/*	END-OF-SECTION */


/* Calling SmartContract Functions */
async function createGoodTimes() {
	const name = document.getElementById("input-name").value;
	const duration = document.getElementById("input-duration").value;
	const eth = document.getElementById("input-eth").value;

	var resultElement = document.getElementById("create-gtc-result");
	resultElement.innerHTML = 'Waiting for Tx <div class="loader"></div>';
	goodTimesContract.methods.createGoodTimes(name, duration)
	.send({from: ethereum.selectedAddress, value: web3.utils.toWei(eth) })
	.then(tx => resultElement.innerHTML = "Wohoo, created Good times! Id: " + tx.events.GtcCreated.returnValues.gtcId)
	.catch(err => {
		console.log(err);
		resultElement.innerHTML = "Tx failed: " + parseWeb3Error(err);		
	} )

	
	
}

async function getGoodTimeObj(id) {
	let gtc = await goodTimesContract.methods.goodTimesRegistry(id).call({ from: ethereum.selectedAddress});
	console.log(gtc.name);
	return gtc;
}

async function callPledgeFunds() {
	const gtcId = document.getElementById("pledge-id").value;
	const amountEth = document.getElementById("pledge-eth").value;
	const resultElem = document.getElementById("confirm-result");
	resultElem.className = "tx-result";
	resultElem.innerHTML = 'Waiting for Tx <div class="loader"></div>';
	await goodTimesContract.methods.pledgeFunds(gtcId).send(
		{from: ethereum.selectedAddress, value: web3.utils.toWei(amountEth)})
		.then(res => resultElem.innerHTML = "Pledged succesfull")
		.catch(err => {
			console.log(err);
			resultElem.innerHTML = "Pledged failed! " + parseWeb3Error(err);
		});
}

async function callCheckEnrolled() {
	const gtcId = document.getElementById("gtc-id-input").value;
	let result = await goodTimesContract.methods.checkIfUserIsEnrolled(gtcId).call({ from: ethereum.selectedAddress});

	var para = document.createElement("P");	
	var t = document.createTextNode(`${result}`);
	para.style.fontWeight = "bold";
	para.style.margin = "5px";
	para.appendChild(t);
	document.getElementById("enrolled-result").appendChild(para);
}

 function callGetUsersGtc(){
	goodTimesContract.methods.getUsersGTCs()
		.call({from: ethereum.selectedAddress})
		.then(
			data => {
				fillTableData(data);
			}
		);
}

function callConfirmWithdrawal(gtcId) {
	const tx = goodTimesContract.methods.confirmWithdrawal(gtcId).send({from: ethereum.selectedAddress});
	var resultElement = document.getElementById("confirm-result")
	resultElement.className = "tx-result";
	resultElement.innerHTML = 'Waiting for Tx <div class="loader"></div>';
	tx.then(res => resultElement.innerHTML = "Confirmation succesfull for gtc with id: " + res.events.ConfirmationAdded.returnValues.gtcId )
	.catch(err => {
		console.log(err);
		resultElement.innerHTML = "Confirmation failed " + parseWeb3Error(err);
	});
}

async function callSendFunds(gtcId) {
	const tx = goodTimesContract.methods.sendFundsToBookingContract(gtcId).send({from: ethereum.selectedAddress});
	var resultElement = document.getElementById("confirm-result")
	resultElement.className = "tx-result";
	resultElement.innerHTML = 'Waiting for Tx <div class="loader"></div>';
	tx.then(res => resultElement.innerHTML = "Funds sent succesfully for gtc with id: " + res.events.WithdrawalSuccess.returnValues.gtcId )
	.catch(err => {
		console.log(err);
		resultElement.innerHTML = "Tx failed: " + parseWeb3Error(err);
	});
}

/*	END-OF-SECTION */

/* Dom manipulation */

function fillTableRowWithGtcResult(gtcObject) {
	let table = document.getElementById("usersGtc");
	let row = table.rows.namedItem("gtc" + gtcObject.id);

	row.cells[1].innerHTML = gtcObject.name;

	// Create new headers
	if (table.tHead.childElementCount <= 3)
	{
		let newColumn = document.createElement("th");
		newColumn.innerHTML = "Budget";
		table.tHead.appendChild(newColumn);
		
		newColumn = document.createElement("th");
		newColumn.innerHTML = "Duration";
		table.tHead.appendChild(newColumn);
	
		newColumn = document.createElement("th");
		newColumn.innerHTML = "Confirmations";
		table.tHead.appendChild(newColumn);
		newColumn = document.createElement("th");
		newColumn.innerHTML = "Status";
		table.tHead.appendChild(newColumn);
	}
	const cellsExist = row.cells.length >= 7;
	let budgetCell = cellsExist ? row.cells[3] : document.createElement("td");
	budgetCell.innerHTML = web3.utils.fromWei(gtcObject.budget, "ether") + " ETH";

	let durationCell = cellsExist ? row.cells[4] : document.createElement("td");
	durationCell.innerHTML = gtcObject.durationInDays + " days";

	let confirmations = cellsExist ? row.cells[5] : document.createElement("td")
	confirmations.innerHTML = web3.utils.fromWei(gtcObject.confirmations, "ether") + " ETH";

	let statusCell = cellsExist ? row.cells[6] : document.createElement("td")
	statusCell.innerHTML = gtcObject.closed ? "Closed" : "Open";	

	if (!cellsExist)
	{
		row.appendChild(budgetCell);
		row.appendChild(durationCell);
		row.appendChild(confirmations);
		row.appendChild(statusCell);
	}
}

async function createTableFromArray() {
	let table = document.createElement("table"),
		thead = document.createElement("thead"),
		tbody = document.createElement('tbody'),
		th = document.createElement("th");
	
	table.id = "usersGtc";
	th.innerHTML = "Gtc Id"; 	
	thead.appendChild(th);

	th = document.createElement("th");
	th.innerHTML = "Name";
	thead.appendChild(th);

	th = document.createElement("th");
	th.innerHTML = "Action";
	thead.appendChild(th);

	table.appendChild(thead);
	table.appendChild(tbody);
	// table.style.background = "#fff";
	return table;
}

async function fillTableData(arr) {
	let table = document.getElementById("usersGtc");

	if (table === null)
	{
		table = await createTableFromArray();
		document.body.append(table);
		document.body.appendChild(await createSendFundsForm());
	}
	for (let i = 0; i < arr.length; i++) {
		const gtcId = arr[i];
		let tr = table.rows.namedItem("gtc" + gtcId);
		
		if (tr === null)
		{
			tr = document.createElement("tr");
			tr.id = "gtc" + gtcId;
			let td = document.createElement("td");
			td.innerHTML = gtcId;
			tr.appendChild(td);		
			tr.appendChild(document.createElement("td")); // placeholder for Name column

			td = document.createElement("td");

			let btnElement = document.createElement("button");
			btnElement.type = "button";
			btnElement.innerHTML = "Get Info";
			btnElement.onclick = async function () {				
				fillTableRowWithGtcResult(await getGoodTimeObj(gtcId));
			};

			let withdrawBtn = document.createElement("button");
			withdrawBtn.type = "button";
			withdrawBtn.innerHTML = "Confirm Withdrawal";
			withdrawBtn.onclick = async function () {				
				await callConfirmWithdrawal(gtcId);
			};
			
			td.appendChild(btnElement);
			td.appendChild(withdrawBtn);
			tr.appendChild(td);

			table.tBodies[0].appendChild(tr);
		}		
	}
}

async function createSendFundsForm() {
	let root = document.createElement("div"),
		form = document.createElement("div"),
		inputWrapper = document.createElement("div"),
		inputLabel = document.createElement("label"),
		input = document.createElement("input"),
		btnWrapper = document.createElement("div"),
		btn = document.createElement("input");
	
	root.className = "wrapper";
	form.className = "form";

	inputWrapper.className = "inputfield";
	inputLabel.innerHTML = "GTC id";
	input.type = "text";
	input.className = "input";
	input.id = "send-funds-id";
	inputWrapper.appendChild(inputLabel);
	inputWrapper.appendChild(input);

	btnWrapper.className - "inputfield";
	btn.type = "submit";
	btn.id = "send-funds-btn";
	btn.className = "btn";
	btn.value = "Send funds to booking Contract";
	btn.onclick = async function () {				
				await callSendFunds(input.value);
			};
	btnWrapper.appendChild(btn);

	form.appendChild(inputWrapper);
	form.appendChild(btnWrapper);
	let info = document.createElement("p");
	info.innerHTML = "WARNING: Booking Contract oracle not implemented yet.<i> All your funds are belong to us</i>  (:";
	form.appendChild(info);
	root.appendChild(form);

	
	return root;
}

/* event handlers */
document.getElementById("pledge-btn").onclick = callPledgeFunds;
document.getElementById("get-mygtcs").onclick = callGetUsersGtc;

// const checkEnrolled = document.getElementById('check-enrolled');
// checkEnrolled.onclick = callCheckEnrolled;

const createGtcButton = document.getElementById("create-gtc");
createGtcButton.onclick = createGoodTimes;



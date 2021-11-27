const goodTimesAddress = "0xCB7E4a689C0430174BD81cA0bb62b8700e96FC8b";
const GTC_ABI_PATH = "../build/contracts/GoodTimesContract.json";
let goodTimesContract;
let proba;
var web3;
// const Web3 = require("web3")

window.addEventListener('load', onPageLoad);

async function onPageLoad()
{
	if (typeof window.ethereum !== 'undefined')
	{
		console.log("Metamask detected!");
		let mmDetected = document.getElementById('mm-detected');
		mmDetected.innerHTML = "MetaMask detected, nice ;)"

		await loadAbi(); //await
		window.addEventListener('click', checkConnection);
		await checkConnection();
	}
	else
	{
		console.log("Metamask Not Available!");
		alert("You need to install MetaMask or another wallet !");
	}
}


async function loadAbi(){
	let currentContractAddress = goodTimesAddress;
	var json = await $.getJSON(GTC_ABI_PATH);
		//.then((data) => console.log(data), (err) => console.log(err));
	let abi = json.abi; 
	web3 = new Web3(window.ethereum);
	goodTimesContract = new web3.eth.Contract(abi, currentContractAddress);
	goodTimesContract.setProvider(window.ethereum);
}


const mmEnable = document.getElementById('mm-connect');

mmEnable.onclick = async () => {
	console.log("someone clicked the button");
	await ethereum.request({method: 'eth_requestAccounts'});

	const currentAccount = document.getElementById('mm-current-account');
	currentAccount.innerHTML = "Your account is: " + ethereum.selectedAddress;
	
}


/* Calling SmartContract Functions */
async function createGoodTimes() {
	const name = document.getElementById("input-name").value;
	const duration = document.getElementById("input-duration").value;
	const eth = document.getElementById("input-eth").value;
	let tx = await goodTimesContract.methods.createGoodTimes(name, duration)
	.send({from: ethereum.selectedAddress, value: web3.utils.toWei(eth) });

	var resultElement = document.getElementById("create-gtc-result")
	resultElement.textContent += ("Wohoo, created Good times! Id: " + tx.events.GtcCreated.returnValues.gtcId);
}

async function getGoodTimeObj(id) {
	let gtc = await goodTimesContract.methods.goodTimesRegistry(1).call({ from: ethereum.selectedAddress});
	console.log(gtc.name);
	return gtc;
}

async function callCheckEnrolled() {
	const gtcId = document.getElementById("gtc-id-input").value;
	console.log(gtcId);

	proba = await goodTimesContract.methods.checkIfUserIsEnrolled(gtcId).call({ from: ethereum.selectedAddress});

	// await goodTimesContract.methods.checkIfUserIsEnrolled(gtcId).call({ from: ethereum.selectedAddress})
	// 	.then(res => proba = res).catch(console.log);

	//await probata().
	var para = document.createElement("P");	
	var t = document.createTextNode(`${proba}`);
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
				createTableFromArray(data);
			}
		);

}
/*	*** */
function fillTableRowWithGtcResult(gtcObject) {
	let table = document.getElementById("usersGtc");
	let row = table.rows.namedItem("gtc" + gtcObject.id);

	row.cells[1].innerHTML = gtcObject.name;

	// Create new headers
	if (table.rows[0].cells.length <= 3)
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
	}

	let td = document.createElement("td")
	td.innerHTML = web3.utils.fromWei(gtcObject.budget, "ether") + " ETH";
	row.appendChild(td);

	td = document.createElement("td")
	td.innerHTML = gtcObject.durationInDays; + "days";
	row.appendChild(td);

	td = document.createElement("td")
	td.innerHTML = web3.utils.fromWei(gtcObject.confirmations, "ether") + " ETH";
	row.appendChild(td);
}

async function createTableFromArray(arr) {
	let table = document.createElement("table"),
		thead = document.createElement("thead"),
		tbody = document.createElement('tbody'),
		th = document.createElement("th");
	
	table.id = "usersGtc"; //table.onclick = highlight;
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
	for (let i = 0; i < arr.length; i++) {
		const gtcId = arr[i];
		let tr = document.createElement("tr");
		let td = document.createElement("td");
		td.innerHTML = gtcId;
		tr.appendChild(td);
		tr.id = "gtc" + gtcId;
		tr.appendChild(document.createElement("td")); // placeholder for Name column

		let btnElement = document.createElement("button");
		btnElement.type = "button";
		btnElement.innerHTML = "get Gtc Details";
		btnElement.onclick = async function() { 
			// var id = await getGoodTimeObj(gtcId);
			fillTableRowWithGtcResult(await getGoodTimeObj(gtcId)) 
		};
		td = document.createElement("td");
		td.appendChild(btnElement);
		tr.appendChild(td);

		tbody.appendChild(tr);
	}
	document.body.append(table);
}

async function probata() {
	throw 'myException';
}

document.getElementById("get-mygtcs").onclick = callGetUsersGtc;

const checkEnrolled = document.getElementById('check-enrolled');
checkEnrolled.onclick = callCheckEnrolled;

const createGtcButton = document.getElementById("create-gtc");
createGtcButton.onclick = createGoodTimes;


async function checkConnection(){
	web3.eth.net.isListening()
	.then(async (s) => {
		let network = await web3.eth.net.getNetworkType();
		document.getElementById("conn-status").innerHTML = 
			"Connected to the blockchain node! " + "<b>network: " + network +"</b>";
		console.log('We\'re connected to the node');
	})
	.catch((e) => {
		document.getElementById("conn-status").innerHTML = "<b>NO connection to the blockchain node !</b>";
		console.log('No connection to the node !');		
	});
}

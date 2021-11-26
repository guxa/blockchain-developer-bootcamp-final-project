const goodTimesAddress = "0x57A185a1c7304faC0D7e816D4B9f0D639F21dE83";
const GTC_ABI_PATH = "../build/contracts/GoodTimesContract.json";
let goodTimesContract;
let proba;
var web3;
// const Web3 = require("web3")

console.log("Hello dapp developers !")

window.addEventListener('load', onPageLoad);

async function onPageLoad()
{
	if (typeof window.ethereum !== 'undefined')
	{
		console.log("Metamask detected!");
		let mmDetected = document.getElementById('mm-detected');
		mmDetected.innerHTML = "MetaMask has been detected !"

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

async function createGoodTimes() {
	const name = document.getElementById("input-name").value;
	const duration = document.getElementById("input-duration").value;
	const eth = document.getElementById("input-eth").value;
	let tx = await goodTimesContract.methods.createGoodTimes(name, duration)
	.send({from: ethereum.selectedAddress, value: web3.utils.toWei(eth) });

	var resultElement = document.getElementById("create-gtc-result")
	resultElement.textContent += ("Wohoo, created Good times! Id: " + tx.events.GtcCreated.returnValues.gtcId);
}

async function callCheckEnrolled() {
	const gtcId = document.getElementById("gtc-id-input").value;
	console.log(gtcId);
	// var web3 = new Web3(window.ethereum);
	try {
		proba = await goodTimesContract.methods.checkIfUserIsEnrolled(gtcId).call({ from: ethereum.selectedAddress});
	} catch (error) {
		console.log(error);
	}
	// await goodTimesContract.methods.checkIfUserIsEnrolled(gtcId).call({ from: ethereum.selectedAddress})
	// 	.then(res => proba = res).catch( err => console.log(err));

	//await probata().
	var para = document.createElement("P");	
	var t = document.createTextNode(`${proba}`);
	para.style.fontWeight = "bold";
	para.appendChild(t);
	document.getElementById("enrolled-result").appendChild(para);
}

 function callGetUsersGtc(){
	let arr;
	goodTimesContract.methods.getUsersGTCs()
		.call({from: ethereum.selectedAddress})
		.then(
			data => {
				arr = data;
				let table = document.createElement("table");
				let innerHt = "";
				innerHt += "<tr class='firstRow'><th>Gtc Id</th><th>Title</th></tr>";
				for (let i = 0; i < arr.length; i++) {
					const gtcId = arr[i];
					innerHt += `<tr><td>${gtcId}</td> <td>Name </td> </tr>`
				}
				table.innerHTML = innerHt;
				document.body.append(table);
			}
		);

}

async function probata() {
	throw 'myException';
}

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

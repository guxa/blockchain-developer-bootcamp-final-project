# Good times Dapp
## Project description

### Intro
Living in the current era we have witnessed a soaring number of burnouts, with people working from home, working remotely from anywhere, working on the move, resulted in  decreased time people socialize in person or just chill on a random beach enjoying the serenity. This dapp will try to force people to take a break and spend some leisure time with their friends on a random destination. The final goal will be to connect people to activities of interest which they and their friends can afford, skip the planning part of their trip and jump to Let's GO instead !
It uses a multi-signature wallet concept, with some modifications like the confirmations required for withdrawal(sending funds to LetsGo contact) depends on the amount of ETH the users who confirmed withdrawal have pledged as % of a budget.

### User Flow

1. User creates a new Good Times by entering a title, duration in days, and ETH they want to pledge as initial budget for the good time.

2. Besides creating, the user can also "join" a good time by pledging funds to a GoodTime if he knows the id of the GoodTime his friends created. The user needs to enter the id of the GoodTime, and the amount of ETH he wants to pledge, then click the **[Pledge funds for GoodTime]** button which will send a Tx and add the user as a participant to the GoodTime.

3. The user can see the good times he is participating in, by clicking the **[Get GoodTimes you participate in]** button
3.1 From the list of good times, the user can get more details about the GoodTime, by clicking **[Get info]**. This will show the Budget(total funds pledged to GoodTime), Duration, Confirmations, and status.

4. The user can confirm withdrawal by clicking **[Confirm withdrawal]** button, this increases the confirmation amount of the GoodTimes by the value that User has pledged to that specific GoodTime. The confirmations are crucial to send funds to the Booking contract (LetsGo contract). The % of confirmations as part of the budget depends on the value in withdrawThreshold variable.

5. Send funds to booking contract - this sends the GoodTime budget, to the booking contract. For this to be succesfull, the confirmation amount of the GoodTimes must be at least 50% of the budget . NOTE: the booking contract (LetsGo.sol) is not yet implemented, to finish it we will need some sort of Oracle that can communicate with sites like (Booking.com, Expedia, Ticketmaster) and make reservations/buy tickets for events.

## Web app URL
https://guxa.github.io/


## Folder structure
- `./client`: Front end application files (Vanilla JS, HTML, CSS)
- `./contracts`: Solidity smart contracts
- `./migrations`: migration scripts for deploying the smart contracts
- `./test`: JS tests for the solidity smart contract GoodTimesContract.sol

## Prerequisites
### If using the hosted app:
1. MetaMask extension for browser
2. Make sure you are using Ropsten testnet
3. Have some testnet ETH for transactions ^^

### For running locally
1. NodeJS v8.9.4 or later and npm v5.0.3 or later
2. Install truffle `npm install -g truffle` 
3. Git clone this repository in new folder
4. Open a terminal, navigate to the folder where you cloned the repo
5. run `npm install`
6. Open another terminal, start a local blockchain instance using Ganache `ganache-cli -p 8545` leave this terminal open
7. Compile and deploy the smartcontracts: In the first terminal, go to the root of the repo and run `truffle compile` then `truffle migrate --network development`
8. Open `client/index.html` in your Browser (make sure you have MetaMask installed)
9. Have a good time (:)

## Test
- Make sure you have truffle installed (see steps 1 and 2 above)
- Navigate to the folder where you cloned the repository
- run `truffle test`


## Future developments

1. Implement the LetsGo contract, create Oracle that can automate the use of the pledge funds where possible. For example by making calls to booking, expedia, ticketmaster APIs and making a reservation, or buying tickets etc.

2. When making a deposit, the user can also provide an arbitrary username. That "username" and the address that they use to deposit these funds will be used to "connect" them to their circle of humans. Later if they deposit funds to the same GTC contract from other address that one also will be included in the system and appended with the initial username.

3. Users can also provide the eth addresses of people in their circle who they wish to travel with. This will act as some kind of a contact list.

4. Depending on the settings, once in a specific period of time, or On demand the system will propse activities which include people who have pledged funds in the GoodTimes that were transfered to LetsGo. The matching will also take in consideration the pledged funds, when generating the proposals. The user can then accept or deny the proposal. If the user denies a new proposal will be generated after a specified time.

5. If the GTC contract funds are not used in 6 months since their deployment, they will be "burned" or sent to a smart contract which can provide funds to cover the fees of other people who can not afford to do a certain activity.


### Even further developments
Users will register with regular account by providing a list of activities the prefer, locations they wish to visit, favourite artists (spotify api), food etc.

Users  will receive notifications with proposed activities, based on their interests, distance willing to travel or region willing to travel to, and friends.
They will pledge their funds to a certain activity in the future.


# Public ETH address for certification
`0x9F7B9F1B7c08836D567Fa56b488FFEaCEf9ce09f`
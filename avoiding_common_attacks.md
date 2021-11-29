# Security measures
The following Security measures, that were listed in the Final Project Design Patterns and Security Measures document, are used:

## Using specific compiler pragma
- We are using compiler version 0.8+ to prevent uint owerflows.
Also this version allows us to return an entire struct directly, instead of returning the fields of the struct as separate return variables.

## Use Modifiers only for validation
- As can be noted all of the modifiers we are using, have the responibility of validating data and actions, they are not modifying any data or handling any extensive business logic.

## Checks-Effects-Interactions
- As can be noted in the  GoodTimesContract.sendFundsToBookingContract(uint256) we are avoiding state changes after external calls, we modify the closed status before the call to the external contract, to avoid any possible danger.
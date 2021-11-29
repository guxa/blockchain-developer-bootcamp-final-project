# Design pattern decisions
The following patterns, that were listed in the Final Project Design Patterns and Security Measures document, are used:

## Inter contract execution
- GoodTimes contract calls LetsGo contract's function receiveFundsFromGtc to send the funds from a GoodTime to the LetsGo contract registering the GoodTime to which they belong.

## Access Control Design Patterns
- Restricting access to certain functions, like GoodTimesContract.updateLetsGoAddress(address) with onlyOwner() modifier from the Ownable library.

## Inheritance and Interfaces (inherit from ownable and pausible)
- GoodTimesContract is inheriting Ownable library from OpenZeppelin, and using the LetsGoInterface, so in the future an upgraded version of the LetsGo contract can be injected into GoodTimesContract through updateLetsGoAddress.

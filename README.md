# meangirls

[![Travis CI badge](https://api.travis-ci.com/hagemt/node-meangirls.svg?branch=main)](https://travis-ci.org/hagemt/node-meangirls)

Serialize-able data types for resilient eventually-consistent subsystems. (in JavaScript, i.e. ES6 = ECMA 2015)

*DISCLAIMER*: This package is considered "beta" in build quality. Vet it for use cases, just like all other dependencies. We currently enjoy full test coverage; however, not all types have undergone trials in production nor rigorous performance characterization.

## Releases

This package follows Semantic Versioning 2.0.0, with one additional constraint:

An odd minor version (e.g. 0.1.2) indicates the intention for development purposes.

Please file bugs (GitHub issues) and/or open pull-requests; contributors are welcome.

## Use Cases

Counters and sets are particularly useful for ledgers.

1. They are simple to merge and "tack on" adjustments in USD and other currencies
2. Attach metadata or a "capped" grow-only counter for outlays in customers' favor
3. Limit buy-back charges (in part or aggregate to the amount originally billed)

For example, if an account has transaction groups relevant to an invoice:

* Use one or more grow-only (G) counters or PN counter(s) for pay/refunds
* Use a set of IDs for the counter group(s) relevant to any one account

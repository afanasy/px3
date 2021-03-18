# px3
Lightweight Poloniex client

 - 0 deps
 - Battle tested
 - No Push API

## Examples
```js
var px3 = require('px3')({
  key: 'AAAAAAAA-BBBBBBBB-CCCCCCCC-DDDDDDDD', // optional, your API key
  secret: '0123456789abcdef0123456789abcdef', // optional, your API secret
  timeout: 5000, // optional, request timeout in ms, default 10000 (10s)
})

px3('returnTicker', function (err, ticker) {
  console.log(err, ticker)
})

px3('buy', {currencyPair: 'BTC_ETH', rate: 0.03911613, amount: 1.23456789}, function (err, order) {
  console.log(err, order)
})
```

For the full Poloniex API documentation, please refer to https://docs.poloniex.com/

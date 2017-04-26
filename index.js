var https = require('https')
var querystring = require('querystring')
var crypto = require('crypto')

module.exports = function (config) {
  'use strict'
  config = config || {}
  if (typeof config.timeout == 'undefined')
    config.timeout = 10000
  return function (command, d, done) {
    if (typeof d == 'function') {
      done = d
      d = {}
    }
    d = d || {}

    var key = d.key || config.key
    var secret = d.secret || config.secret
    delete d.key
    delete d.secret
    d.command = command
    d.nonce = (Date.now() * 1000) + Math.round(((process.hrtime()[1] / 1e6) % 1) * 1e3)
    var query = querystring.stringify(d)

    var request = {
      method: 'GET',
      hostname: 'poloniex.com',
      path: '/public?' + query
    }
    if (['returnBalances', 'returnCompleteBalances', 'returnDepositAddresses', 'generateNewAddress', 'returnDepositsWithdrawals', 'returnOpenOrders', 'returnOrderTrades', 'buy', 'sell', 'cancelOrder', 'moveOrder', 'withdraw', 'returnAvailableAccountBalances', 'returnTradableBalances', 'transferBalance', 'returnMarginAccountSummary', 'marginBuy', 'marginSell', 'getMarginPosition', 'closeMarginPosition', 'createLoanOffer', 'cancelLoanOffer', 'returnOpenLoanOffers', 'returnActiveLoans', 'toggleAutoRenew', 'returnTradeHistory'].indexOf(command) != -1) {
      request.method = 'POST'
      request.path = '/tradingApi'
      request.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Key: key,
        Sign: crypto.createHmac('sha512', secret).update(query).digest('hex')
      }
    }
    console.log(request, query, config)
    var req = https.request(request, function (res) {
      var data = ''
      res.setEncoding('utf8')
      res.on('data', function (chunk) {data += chunk})
      res.on('end', function () {
        try {data = JSON.parse(data)}
        catch (e) {
          if (res.statusCode == 200)
            return done(e)
        }
        if (data && data.error)
          return done(data.error)
        if (res.statusCode != 200)
          return done('Status code ' + res.statusCode)
        done(null, data)
      })
    })
    req.setTimeout(config.timeout)
    req.on('error', done)
    if (request.method == 'POST')
      req.write(query)
    req.end()
  }
}
var https = require('https')
var querystring = require('querystring')
var crypto = require('crypto')

module.exports = function (config) {
  'use strict'
  config = config || {}
  if (typeof config.timeout == 'undefined')
    config.timeout = 10000
  config.tradingApi = config.tradingApi || ['returnBalances', 'returnCompleteBalances', 'returnDepositAddresses', 'generateNewAddress', 'returnDepositsWithdrawals', 'returnOpenOrders', 'returnOrderTrades', 'buy', 'sell', 'cancelOrder', 'moveOrder', 'withdraw', 'returnAvailableAccountBalances', 'returnTradableBalances', 'transferBalance', 'returnMarginAccountSummary', 'marginBuy', 'marginSell', 'getMarginPosition', 'closeMarginPosition', 'createLoanOffer', 'cancelLoanOffer', 'returnOpenLoanOffers', 'returnActiveLoans', 'toggleAutoRenew', 'returnTradeHistory', 'returnLendingHistory']
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
      hostname: 'poloniex.com',
      path: '/public?' + query
    }
    if (config.tradingApi.indexOf(command) != -1) {
      request.method = 'POST'
      request.path = '/tradingApi'
      request.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Key: key,
        Sign: crypto.createHmac('sha512', secret).update(query).digest('hex')
      }
    }

    var req = https.request(request, function (res) {
      var data = ''
      res.setEncoding('utf8')
      res.on('data', function (chunk) {data += chunk})
      res.on('end', function () {
        try {data = JSON.parse(data)}
        catch (e) {
          if (res.statusCode == 200)
            return done(e, null, res)
        }
        if (data && data.error)
          return done(data.error, null, res)
        if (res.statusCode != 200)
          return done('Status code ' + res.statusCode, null, res)
        done(null, data, res)
      })
    })
    req.setTimeout(config.timeout)
    req.on('error', done)
    if (request.method == 'POST')
      req.write(query)
    req.end()
  }
}

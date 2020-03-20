const fetch = require("node-fetch")
const utils = require('./constants')

exports.parseRulya = () =>
    fetch(utils.exchangeUrls.rulya, {mode: "cors"}).then(res => res.text())

exports.parseGovbank = () =>
    fetch(utils.exchangeUrls.govermentBank, {mode: "cors"}).then(res => res.text())
  
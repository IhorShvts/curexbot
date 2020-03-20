const cheerio = require("cherio")
const dataParsers = require("./dataParsers")

exports.extractRulyaData = () =>
    dataParsers
        .parseRulya()
        .then(res => {
            const data = []
            const $ = cheerio.load(res)
            $("#ltblBAK tr:not(:first-child)").each((i, elem) => {
                data.push({
                    currency: $(elem)
                        .find("td b")
                        .text()
                        .substring(0, 3),
                    buy: Number(
                        $(elem)
                            .find("td:nth-child(2)")
                            .text()
                    ),
                    sell: Number(
                        $(elem)
                            .find("td:nth-child(3)")
                            .text()
                    )
                })
            })
            const usdCourse =
                data.length > 0 && data[0].currency === "USD"
                    ? `Rulya: ${data[0].buy}/${data[0].sell}`
                    : "Rate of currency of Rulya exchangers is temporarily unavailable"
            return usdCourse
        })
        .catch(err => {
            console.error(`Error parsing Rulya data: ${err}`)
        })

exports.extractGovbankData = () =>
    new Promise((resolve, reject) => {
        let isDone = false
        let count = 5

        async function recurse() {
            count -= 1
            dataParsers
                .parseGovbank()
                .then(res => {
                    if (res) {
                        const data = []
                        const findUsd = JSON.parse(res).find(cur => cur.cc === "USD")
                        data.push(findUsd)
                        const usdCourse = `NBU: ${data[0].rate}`
                        isDone = true
                        resolve(usdCourse)
                    } else if (count === 0) {
                        isDone = true
                        resolve(`Rate of currency of NBU is temporarily unavailable`)
                    }
                })
                .catch(err => {
                    if (!isDone) {
                        console.log(`Will retry loading Govbank data`)
                        setTimeout(recurse, 1000)
                    }
                })
        }

        recurse()
    })

const moment = require("moment")
const constants = require("./utils/constants")
const exchangers = require("./utils/dataMappings")
process.env.NTBA_FIX_319 = 1 // fix telebot warning message
const TelegramBot = require("node-telegram-bot-api")

const bot = new TelegramBot(constants.token.value, {polling: true})

async function dataInit() {
    return {
        rulya: await exchangers.extractRulyaData(),
        nbu: await exchangers.extractGovbankData()
    }
}

bot.on("message", msg => {
    const {
        chat: {id}
    } = msg
    if (msg.text === "/curex" || msg.text === "/curex@ur_curex_bot") {
        dataInit()
            .then(res => {
                const now = `Course of USD on ${moment(new Date()).format("DD/MM/YYYY")}`
                const formatedData = `${now}\n${res.rulya}\n${res.nbu}\n=^.^=`
                bot.sendMessage(id, formatedData)
            })
            .catch(err => {
                console.error(`Error on initialization data: ${err}`)
            })
    }
})

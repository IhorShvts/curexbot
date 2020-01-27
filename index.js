const fetch = require('node-fetch');
const cheerio = require('cherio');
const moment = require('moment');

process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '991762238:AAFS97rgMG-fzpWrvXVgmITxX12c5VQbmdU';
const bot = new TelegramBot(TOKEN, { polling: true });
const exchangeUrls = {
  rulya: 'http://rulya-bank.com.ua/',
  govermentBank:
    'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json'
};

const now = `Course of USD on ${moment(new Date()).format('DD/MM/YYYY')}`;

const parseRulya = () =>
  fetch(exchangeUrls.rulya, { mode: 'cors' }).then(res => res.text());
const updateRulya = () =>
  parseRulya()
    .then(response => {
      const data = [];
      const $ = cheerio.load(response);
      $('#ltbl tr:not(:first-child)').each((i, elem) => {
        data.push({
          currency: $(elem)
            .find('td b')
            .text()
            .substring(0, 3),
          buy: Number(
            $(elem)
              .find('td:nth-child(2)')
              .text()
          ),
          sell: Number(
            $(elem)
              .find('td:nth-child(3)')
              .text()
          )
        });
      });
      return data[0];
    })
    .catch(err => {
      throw new Error(err);
    });

const parseGovbank = () =>
  fetch(exchangeUrls.govermentBank, { mode: 'cors' }).then(res => res.text());
const updateGovbank = () =>
  parseGovbank()
    .then(response => {
      const data = [];
      const findUsd = JSON.parse(response).find(cur => cur.cc === 'USD');
      data.push(findUsd);
      return data[0];
    })
    .catch(err => {
      throw new Error(err);
    });

const updateAllData = async () => {
  return {
    rulya: await updateRulya(),
    nbu: await updateGovbank()
  };
};

async function init() {
  return await updateAllData();
}

bot.on('message', msg => {
  init().then(res => {
    const formatedData = `${now}\nRulya: ${res.rulya.buy}/${res.rulya.sell}\nNBU: ${res.nbu.rate}\n=^.^=`;
    const {
      chat: { id }
    } = msg;
    bot.sendMessage(id, formatedData);
  });
});

const SlackBot = require('slackbots')
const Parser = require('html-parser')
const { CronJob } = require('cron')
const fetchUrl = require("fetch").fetchUrl;

require('dotenv').config()

const url = process.env.PAGE_URL
const botParams = {
    icon_emoji: ':cat:'
};

const initBot = () => {
    const bot = new SlackBot({
        token: process.env.SLACK_TOKEN,
        name: 'Capes Checker'
    })
    
    bot.on('start', function() {
        console.log('Bot enabled')
    });
    
    return bot
}

const fetch = async (url) => {
    return new Promise(async (resolve, reject) => {
        fetchUrl(url, (error, meta, body) => {
            if (error) {
                reject(error)
            } else {
                resolve(body)
            }
        })
    })
}

const checkPageContent = async () => {
    const res = await fetch(url);
    const body = res.toString()
    
    let hasInfo = false
    const parser = Parser.parse(body, {
        text(text) {
            if (text && text.trim() && text.trim().toUpperCase().indexOf('ESPAGNOL') !== -1) {
                hasInfo = true
            }
        }
    });
    
    return hasInfo
}


const bot = initBot()
let cron = new CronJob(process.env.CRON_TIME, async () => {
    const hasInfo = await checkPageContent()
    
    if (hasInfo && bot) {
        console.log('New info posted')
        bot.postMessageToChannel('general', `¡Hay información disponible! Compruébalo <${url}|*aquí*>`, botParams);
    }
});

cron.start();

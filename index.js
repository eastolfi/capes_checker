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
        // more information about additional params https://api.slack.com/methods/chat.postMessage
        
        
        // define channel, where bot exist. You can adjust it there https://my.slack.com/services 
        // bot.postMessageToChannel('general', `¡Hay información disponible! Compruébalo <${url}|*aquí*>`, params);
        console.log('Bot enabled')
        
        // define existing username instead of 'user_name'
        // bot.postMessageToUser('user_name', 'meow!', params); 
        
        // If you add a 'slackbot' property, 
        // you will post to another user's slackbot channel instead of a direct message
        // bot.postMessageToUser('user_name', 'meow!', { 'slackbot': true, icon_emoji: ':cat:' }); 
        
        // define private group instead of 'private_group', where bot exist
        // bot.postMessageToGroup('private_group', 'meow!', params); 
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

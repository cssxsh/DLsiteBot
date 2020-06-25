const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');

const TOKEN = '1296868975:AAHaknJirDGHLR1aYqLwF0ka68TE81hs6WE';
const url = 'https://racknerd.cssxsh.xyz';
const port = 443;

const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${url}:${port}/bot${TOKEN}`);
const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.post(`/bot${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

const options = {
    key: fs.readFileSync(`/home/cssxsh/.ssl/cloudflare.key`),
    cert: fs.readFileSync(`/home/cssxsh/.ssl/cloudflare.crt`),
};

const httpsServer = https.createServer(options, app);

httpsServer.listen(port);

bot.onText(/\/hentai/, function onLoveText(msg) {
    bot.sendMessage(msg.chat.id, 'Are you a hetai?');
});

// app.listen(port);

bot.onText(/\/prpr/, function onLoveText(msg) {
    const chatId = msg.chat.id;
    request('https://konachan.com/post.json?tags=ass&limit=50', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const result = JSON.parse(body) || [];
            const index = parseInt(Math.random() * result.length);
            bot.sendPhoto(chatId, result[index].file_url, { caption: '手冲一时爽，一直手冲一直爽' }).catch((err) => {
                bot.sendMessage(chatId, '手冲失败');
            });
        } else {
            bot.sendMessage(chatId, '手冲失败');
        }
    });
});

bot.onText(/\/info ([A-Z]{2}\d{6})/, async (msg, match) => {
    const chatId = msg.chat.id;
    const id = match[1];
    let type = 'maniax';

    switch (id.slice(0, 2)) {
        case ('RJ'):
            type = 'maniax'
            break;
    }
    const url = `https://www.dlsite.com/${type}/work/=/product_id/${id}.html`;

    bot.sendMessage(chatId, `get info by ${url}:`);

    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const name = $('#work_name').text();
    bot.sendMessage(chatId, name);
});

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, resp);
});

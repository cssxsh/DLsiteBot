const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require('https');
const fs = require('fs');

const TOKEN = '1296868975:AAHaknJirDGHLR1aYqLwF0ka68TE81hs6WE';
const url = 'https://aliyun.cssxsh.xyz';
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
    key: fs.readFileSync(`${process.env.HOME}/.ssl/4077636_aliyun.cssxsh.xyz.key`),
    cert: fs.readFileSync(`${process.env.HOME}/.ssl/4077636_aliyun.cssxsh.xyz_public.crt`),
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

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, resp);
});

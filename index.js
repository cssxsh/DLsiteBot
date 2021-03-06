const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');

const TOKEN = '1296868975:AAHaknJirDGHLR1aYqLwF0ka68TE81hs6WE';
const URL = 'https://racknerd.cssxsh.xyz';
const PORT = 443;

const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${URL}:${PORT}/bot${TOKEN}`);
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

httpsServer.listen(PORT);

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const cmd = '/start' + '\n' + '/info' + '\n' + '/echo';
    bot.sendMessage(chatId, cmd);
});

bot.onText(/\/info ([A-Z]{2}\d{6})/, async (msg, match) => {
    const chatId = msg.chat.id;
    const id = match[1];
    let type = 'maniax';

    // bot.sendMessage(chatId, `id: ${id}`);

    switch (id.slice(0, 2)) {
        case 'RJ':
            type = 'maniax';
            break;
    }
    const url = `https://www.dlsite.com/${type}/work/=/product_id/${id}.html`;

    // bot.sendMessage(chatId, `get info by ${url}:`);

    const response = await got(url, {
        method: 'get',
    });
    // bot.sendMessage(chatId, response.statusCode);
    const body = response.body;
    try {
        const $ = cheerio.load(body);
        const work_name = $('#work_name').text().trim();
        const work_maker = `${$('th', '#work_maker').text()}: ${$('span.maker_name').html().trim()}`;
        const work_info = $('#work_outline tr');

        const infos = work_info
            .map((index, element) => {
                const name = $('th', element).text().trim();
                const value = $('td', element)
                    .map((index, element) => {
                        let html = '';
                        element.children.forEach((ele) => {
                            const child = $(ele);
                            const type = child.attr('class');
                            switch (type) {
                                case 'work_genre':
                                    ele.children
                                        .map((ele) => {
                                            const child = $(ele);
                                            const url = child.attr('href');
                                            const text = child.text().trim();
                                            html += url ? text.link(url) : text.trim();
                                            return html;
                                        })
                                        .join('&nbsp;');
                                    break;
                                case 'main_genre':
                                    html += child.html().trim();
                                    break;
                                default:
                                    const url = child.attr('href');
                                    const text = child.text().trim();
                                    html += url ? text.link(url) : text.trim();
                            }
                        });
                        return html.trim().replace(/<\/a>/g, '<\/a> ');
                    })
                    .get()
                    .join('&nbsp;');
                return `${name}: ${value}`;
            })
            .get()
            .join('\n');
        // console.log(infos.length);

        let html = `${work_name.link(url)}\n${work_maker}\n${infos}`;

        console.log(html);
        bot.sendMessage(chatId, html, { parse_mode: 'HTML' });
    } catch (e) {
        console.error(e);
    }
});

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, resp);
});

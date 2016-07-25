'use strict';

var tokens = require('./config');

let token = tokens.telegram;
let botanToken = tokens.botan;

let TelegramBot = require('node-telegram-bot-api');
let botan = require('botanio')(botanToken);

let map = require('./src/map');
let markers = require('./src/markers');
let url = require('./src/url');

let bot = new TelegramBot(token, {polling: true});

let opts = {
    parse_mode: "Markdown",
    reply_markup: JSON.stringify({
        "keyboard": [
            [{text: "Send location", request_location: true}]
        ]
    })
}

bot.on('location', function (res) {
    botan.track(res, 'Location');

    let location = [res.location.latitude, res.location.longitude];
    let chatId = res.chat.id;
    markers.scan(location)
        .then(markers.get)
        .then((marks) => {
            let message = 'Sorry, there are no pokemons near you :(';
            if (marks.length) {
                url.getShortUrl(map.getMap(location, marks))
                    .then((link) => {
                        bot.sendMessage(chatId, link, opts);
                    })
            } else {
                bot.sendMessage(chatId, message, opts);
            }
        })
        .catch((err) => {
            console.error(err);
            bot.sendMessage(chatId, 'Ooops! Something gone wrong! Try again later!', opts);
        });
});

bot.on('text', function (res) {
    botan.track(res, 'Start');
    botan.track(res, 'Help');

    let chatId = res.chat.id;
    let helpText = 'Just send to me your current location and I\'ll show you pokemons near you!';
    let text = res.text;

    if (text === '/help' || text === '/start') {
        bot.sendMessage(chatId, helpText, opts);
    }
});

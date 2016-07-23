'use strict';

let TelegramBot = require('node-telegram-bot-api');
let request = require('superagent');
let saPromise = require('superagent-promise-plugin');
let fs = require('fs');
let _ = require('lodash');

saPromise.Promise = Promise;

let token = fs.readFileSync('./.telegramToken', {encoding: 'utf-8'}).trim();
let googleApiKey = fs.readFileSync('./.googleToken', {encoding: 'utf-8'}).trim();

let api = 'https://pokevision.com/map';

let bot = new TelegramBot(token, {polling: true});

let createMarker = function (marker) {
    function icon(id) {
        return `http://ugc.pokevision.com/images/pokemon/${id}.png`;
    }
    return `&markers=icon:${icon(marker.pokemonId)}|${marker.latitude},${marker.longitude}`;
}

let staticMap = function (location, markers) {
    let staticMapQuery = `https://maps.googleapis.com/maps/api/staticmap?key=${googleApiKey}&center=${location.join(',')}&zoom=16&size=600x600`;

    let marks = `&markers=${location.join(',')}`;
    marks += _.map(markers, createMarker).join('');

    staticMapQuery += marks;
    return staticMapQuery;
}

let scanMarkers = function (location) {
    return new Promise((resolve, reject) => {
        request
            .get(api + '/scan/' + location.join('/'))
            .use(saPromise)
            .then((res) => {
                let status = _.get(res, 'body.status');
                if (status === 'success') {
                    resolve(location);
                } else {
                    reject(new Error(status));
                }
            })
            .catch((err) => {
                reject(err);
            });
    })
}

let getMarkers = function (location) {
    return new Promise((resolve, reject) => {
        request
            .get(api + '/data/' + location.join('/'))
            .use(saPromise)
            .then((res) => {
                let status = _.get(res, 'body.status');
                let markers = _.get(res, 'body.pokemon', []);

                if (status === 'success') {
                    resolve(_.get(res, 'body.pokemon'), [])
                } else {
                    reject(new Error(status));
                }
            })
            .catch((err) => {
                reject(err)
            });
    })
}

let shortUrl = function (url) {
    return new Promise((resolve, reject) => {
        request
            .post('https://www.googleapis.com/urlshortener/v1/url?key=' + googleApiKey)
            .use(saPromise)
            .send({
                longUrl: url
            })
            .then((res) => {
                let shortUrl = _.get(res, 'body.id');
                if (shortUrl) {
                    resolve(shortUrl);
                }
                resolve(url);
            })
            .catch((err) => {
                console.error(err);
                resolve(url);
            })
    })
}

bot.on('location', function (res) {
    let location = [res.location.latitude, res.location.longitude];
    let chatId = res.chat.id;
    scanMarkers(location)
        .then(getMarkers)
        .then((markers) => {
            let message = 'Sorry, there are no pokemons near you :(';
            if (markers.length) {
                shortUrl(staticMap(location, markers))
                    .then((url) => {
                        bot.sendMessage(chatId, url);
                    })
            } else {
                bot.sendMessage(chatId, message);
            }
        })
        .catch((err) => {
            console.error(err);
            bot.sendMessage(chatId, 'Ooops! Something gone wrong! Try again later!');
        });
});

bot.on('text', function (res) {
    let chatId = res.chat.id;
    let helpText = 'Just send to me your current location and I\'ll show you pokemons near you!';
    let text = res.text;

    if (text === '/help' || text === '/start') {
        bot.sendMessage(chatId, helpText);
    }
});

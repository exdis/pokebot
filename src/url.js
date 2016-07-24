'use strict';

let googleApiKey = require('../config')['google'];
let request = require('superagent');
let saPromise = require('superagent-promise-plugin');
let _ = require('lodash');

saPromise.Promise = Promise;

module.exports = {
    getShortUrl (url) {
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
}

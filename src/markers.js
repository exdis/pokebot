'use strict';

let request = require('superagent');
let saPromise = require('superagent-promise-plugin');
let _ = require('lodash');
let api = 'https://pokevision.com/map';

saPromise.Promise = Promise;

module.exports = {
    scan (location) {
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
    },

    get (location) {
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
}

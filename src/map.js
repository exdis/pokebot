'use strict';

var googleApiKey = require('../config')['google'];
var _ = require('lodash');

module.exports = {
    icon (id) {
        return `http://ugc.pokevision.com/images/pokemon/${id}.png`;
    },
    createMarker (marker) {
        return `&markers=icon:${this.icon(marker.pokemonId)}|${marker.latitude},${marker.longitude}`;
    },
    getMap (location, markers) {
        let staticMapQuery = `https://maps.googleapis.com/maps/api/staticmap?key=${googleApiKey}&center=${location.join(',')}&zoom=16&size=600x600`;

        let marks = `&markers=${location.join(',')}`;
        marks += _.map(markers, this.createMarker.bind(this)).join('');

        staticMapQuery += marks;
        return staticMapQuery;
    }
}

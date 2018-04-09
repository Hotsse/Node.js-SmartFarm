'use strict';

const weather = require('kma-js').Weather;

let cacheData = null,
    posX = config.weatherPos.x,
    posY = config.weatherPos.y;

exports.get = function(callback){
    return weather.townWeather(posX, posY);
};

exports.pos = function(x, y){
    cacheData = null;
    posX = x;
    posY = y;
};
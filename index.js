/* eslint-env es6, node */
const counters = require('./counters');
const merge = require('./merge');
const parse = require('./parse');
const sets = require('./sets');

module.exports = Object.assign({ merge, parse }, counters, sets);
module.exports.default = module.exports;

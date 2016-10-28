/* eslint-env es6, node */
const merge = (...items) => items.reduce((a, b) => a.merge(b));

module.exports = { default: merge, merge };

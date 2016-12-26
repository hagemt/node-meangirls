/* eslint-env es6, node */

const mergeCRDT = (...items) => items.reduce((a, b) => a.merge(b));

module.exports = mergeCRDT;

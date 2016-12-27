/* eslint-env es6, node */

const merge2 = (a, b) => a.merge(b); // generic Function
Object.defineProperty(merge2, 'name', { value: 'merge' });

const mergeCRDT = (...items) => items.reduce(merge2);

module.exports = mergeCRDT;

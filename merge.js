/* eslint-env es6, node */
const { GCounter, PNCounter } = require('./counters');
const { GSet, TwoPSet, LWWESet, ORSet, MCSet } = require('./sets');

const COUNTER_TYPES = Object.freeze([GCounter, PNCounter]);
const SET_TYPES = Object.freeze([GSet, TwoPSet, LWWESet, ORSet, MCSet]);

const sameCRDTs = (first, ...rest) => {
	const isCRDT = COUNTER_TYPES.includes(first) || SET_TYPES.includes(first);
	return isCRDT ? rest.every(t => t == first) : false; // pass prototypes
};

const isObject = _ => !!_ && (typeof _ === 'object');
const merge2 = (a, b) => a.merge(b); // generic Function
Object.defineProperty(merge2, 'name', { value: 'merge' });

const mergeCRDTs = (...items) => {
	const p = items.filter(isObject).map(Object.getPrototypeOf);
	if (p.length < 2 || p.length !== items.length || sameCRDTs(p)) {
		throw new TypeError('arguments ALL MUST be of the SAME CRDT');
	}
	return items.reduce(merge2);
};

module.exports = mergeCRDTs;

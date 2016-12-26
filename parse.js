/* eslint-env es6, node */
const { GCounter, PNCounter } = require('./counters');
const { GSet, TwoPSet } = require('./sets');

const parseCRDT = (anyCRDT) => {
	const type = (typeof anyCRDT === 'object') ? anyCRDT.type : undefined;
	switch (type) {
	case '2p-set': {
		const { a = [], r = [] } = anyCRDT;
		const set = new TwoPSet();
		for (const e of a) set.add(e);
		for (const e of r) set.remove(e);
		return set;
	}
	case 'g-counter': {
		const { e = {} } = anyCRDT;
		const counter = new GCounter();
		for (const key of Object.keys(e)) {
			counter.bump(key, e[key]);
		}
		return counter;
	}
	case 'g-set': {
		const { e = [] } = anyCRDT;
		const set = new GSet();
		for (const ee of e) set.add(ee);
		return set;
	}
	case 'pn-counter': {
		const { n = {}, p = {} } = anyCRDT;
		const counter = new PNCounter();
		for (const key of Object.keys(n)) {
			counter.bump(key, n[key]);
		}
		for (const key of Object.keys(p)) {
			counter.bump(key, p[key]);
		}
		return counter;
	}
	default:
		throw new TypeError(`unknown CRDT type: ${type}`);
	}
};

module.exports = parseCRDT;

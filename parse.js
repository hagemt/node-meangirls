/* eslint-env es6, node */
const { GCounter, PNCounter } = require('./Counters');
const { GSet, TwoPSet } = require('./Sets');

const parse = (anyCRDT) => {
	const type = (typeof anyCRDT === 'object') ? anyCRDT.type : undefined;
	switch (type) {
	case '2p-set': {
		const { a, r } = anyCRDT;
		const set = new TwoPSet();
		a.forEach((e) => { set.add(e); });
		r.forEach((e) => { set.remove(e); });
		return set;
	}
	case 'g-counter': {
		const { e } = anyCRDT;
		const counter = new GCounter();
		Object.keys(e).forEach((key) => { counter.bump(key, e[key]); });
		return counter;
	}
	case 'g-set': {
		const { e } = anyCRDT;
		const set = new GSet();
		e.forEach((ee) => { set.add(ee); });
		return set;
	}
	case 'pn-counter': {
		const { n, p } = anyCRDT;
		const counter = new PNCounter();
		Object.keys(n).forEach((key) => { counter.bump(key, n[key]); });
		Object.keys(p).forEach((key) => { counter.bump(key, p[key]); });
		return counter;
	}
	default: throw new TypeError(`unknown CRDT: ${type}`);
	}
};

module.exports = { default: parse, parse };

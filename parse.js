/* eslint-env es6, node */
const { GCounter, PNCounter } = require('./counters');
const { GSet, TwoPSet, LWWESet, ORSet, MCSet } = require('./sets');

const isObject = _ => !!_ && (typeof _ === 'object');

const parseCRDT = (anyCRDT = null) => {
	const type = isObject(anyCRDT) ? anyCRDT.type : undefined;
	switch (type) {
	case '2p-set': return TwoPSet.parse(anyCRDT);
	case 'g-counter': return GCounter.parse(anyCRDT);
	case 'g-set': return GSet.parse(anyCRDT);
	case 'lww-e-set': return LWWESet.parse(anyCRDT);
	case 'mc-set': return MCSet.parse(anyCRDT);
	case 'or-set': return ORSet.parse(anyCRDT);
	case 'pn-counter': return PNCounter.parse(anyCRDT);
	default: throw new TypeError(`unknown CRDT type: ${type}`);
	}
};

module.exports = parseCRDT;

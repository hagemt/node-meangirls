/* eslint-env es6, node */
const { GCounter, PNCounter } = require('./counters');
const { GSet, TwoPSet, LWWESet, ORSet, MCSet } = require('./sets');

const isObject = _ => !!_ && (typeof _ === 'object');

const parseCRDT = (anyCRDT = null) => {
	const type = isObject(anyCRDT) ? anyCRDT.type : undefined;
	switch (type) {
	case '2p-set': return TwoPSet.fromJSON(anyCRDT);
	case 'g-counter': return GCounter.fromJSON(anyCRDT);
	case 'g-set': return GSet.fromJSON(anyCRDT);
	case 'lww-e-set': return LWWESet.fromJSON(anyCRDT);
	case 'mc-set': return MCSet.fromJSON(anyCRDT);
	case 'or-set': return ORSet.fromJSON(anyCRDT);
	case 'pn-counter': return PNCounter.fromJSON(anyCRDT);
	default: throw new TypeError(`unknown CRDT type: ${type}`);
	}
};

module.exports = parseCRDT;

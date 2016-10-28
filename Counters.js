/* eslint-env es6, node */
const { EventEmitter } = require('events');

const COUNTERS = new WeakMap();

const sum = (...args) => args.reduce((a, b) => a + b, 0);

const toJSON = map => {
	const object = {};
	map.forEach((value, key) => {
		object[key] = value;
	});
	return object;
};

const update = (map, key, inc) => {
	const oldValue = map.get(key);
	const newValue = inc(oldValue);
	map.set(key, newValue);
	return [newValue, oldValue];
};

class GCounter extends EventEmitter {

	constructor () {
		super(); // mistake to inherit?
		COUNTERS.set(this, { e: new Map() });
	}

	bump (actor = null, delta = 1) {
		if (!(delta > 0)) {
			throw new TypeError('must #update with a positive Number');
		}
		const { e } = COUNTERS.get(this);
		this.emit('update', actor, update(e, actor, (value = 0) => value + delta));
		return this;
	}

	inspect () {
		const { e } = COUNTERS.get(this);
		return { e: toJSON(e), type: 'g-counter' };
	}

	merge (other) {
		if (!(other instanceof GCounter)) {
			throw new TypeError('expected GCounter');
		}
		const merged = new GCounter();
		const { e: e0 } = COUNTERS.get(merged);
		const { e: e1 } = COUNTERS.get(this);
		const { e: e2 } = COUNTERS.get(other);
		e1.forEach((key, v) => { update(e0, key, u => u + v); });
		e2.forEach((key, v) => { update(e0, key, u => u + v); });
		return merged;
	}

	get value () {
		const { e } = COUNTERS.get(this);
		return sum(...e.values());
	}

}

class PNCounter extends EventEmitter {

	constructor () {
		super(); // mistake to inherit?
		COUNTERS.set(this, { n: new Map(), p: new Map() });
	}

	bump (actor = null, delta = 1) {
		const { n, p } = COUNTERS.get(this);
		const map = (delta < 1) ? n : p;
		const number = Math.abs(delta);
		if (number) this.emit('update', actor, update(map, actor, (value = 0) => value + number));
		return this;
	}

	inspect () {
		const { n, p } = COUNTERS.get(this);
		return { n: toJSON(n), p: toJSON(p), type: 'pn-counter' };
	}

	merge (other) {
		if (!(other instanceof PNCounter)) {
			throw new TypeError('expected PNCounter');
		}
		const merged = new PNCounter();
		const { n: n0, p: p0 } = COUNTERS.get(merged);
		const { n: n1, p: p1 } = COUNTERS.get(this);
		const { n: n2, p: p2 } = COUNTERS.get(other);
		n1.forEach((key, v) => { update(n0, key, u => u + v); });
		n2.forEach((key, v) => { update(n0, key, u => u + v); });
		p1.forEach((key, v) => { update(p0, key, u => u + v); });
		p2.forEach((key, v) => { update(p0, key, u => u + v); });
		return merged;
	}

	get value () {
		const { n, p } = COUNTERS.get(this);
		return sum(...p.values()) - sum(...n.values());
	}

}

module.exports = { GCounter, PNCounter };
module.exports.default = module.exports;

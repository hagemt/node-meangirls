/* eslint-env es6, node */
const { EventEmitter } = require('events');

const COUNTERS = new WeakMap(); // private
const increment = (value = 0) => (value + 1);

const sumValues = (map, m = map.size) => {
	if (m === map.m) return map.n; // memoized sum
	let sum = 0; // valid map.n as long as map.m = m
	for (const value of map.values()) sum += value;
	Object.assign(map, { m, n: sum });
	return sum;
};

const toObject = (map, object = {}) => {
	for (const [key, value] of map) {
		object[key] = value;
	}
	return object;
};

const updateMap = (map, key, update = increment) => {
	const oldValue = map.get(key);
	const newValue = update(oldValue);
	map.set(key, newValue);
	return [newValue, oldValue];
};

class GCounter extends EventEmitter {

	constructor () {
		super(); // mistake to inherit?
		COUNTERS.set(this, Object.freeze({ e: new Map() }));
	}

	merge (other) {
		if (!(other instanceof GCounter)) {
			throw new TypeError('expected GCounter');
		}
		const merged = new GCounter();
		const { e: e0 } = COUNTERS.get(merged);
		const { e: e1 } = COUNTERS.get(other);
		const { e: e2 } = COUNTERS.get(this);
		for (const [k, v] of e1) e0.set(k, v + (e0.get(k) || 0));
		for (const [k, v] of e2) e0.set(k, v + (e0.get(k) || 0));
		return merged;
	}

	bump (actor = null, delta = 1) {
		if (!(delta > 0)) {
			throw new TypeError('must #update with a positive Number');
		}
		const { e } = COUNTERS.get(this);
		const update = updateMap(e, actor, (value = 0) => value + delta);
		this.emit('update', update, actor, delta);
		return this;
	}

	get value () {
		const { e } = COUNTERS.get(this);
		return sumValues(e);
	}

	static fromJSON ({ e = {} }) {
		const counter = new GCounter();
		const { e: _e } = COUNTERS.get(counter);
		for (const key of Object.keys(e)) _e.set(key, e[key]);
		return counter;
	}

	static toJSON (anyGCounter) {
		const { e } = COUNTERS.get(anyGCounter);
		return { e: toObject(e), type: 'g-counter' };
	}

}

class PNCounter extends EventEmitter {

	constructor () {
		super(); // mistake to inherit?
		COUNTERS.set(this, Object.freeze({ n: new Map(), p: new Map() }));
	}

	merge (other) {
		if (!(other instanceof PNCounter)) {
			throw new TypeError('expected PNCounter');
		}
		const merged = new PNCounter();
		const { n: n0, p: p0 } = COUNTERS.get(merged);
		const { n: n1, p: p1 } = COUNTERS.get(other);
		const { n: n2, p: p2 } = COUNTERS.get(this);
		for (const [k, v] of n1) n0.set(k, v + (n0.get(k) || 0));
		for (const [k, v] of n2) n0.set(k, v + (n0.get(k) || 0));
		for (const [k, v] of p1) p0.set(k, v + (p0.get(k) || 0));
		for (const [k, v] of p2) p0.set(k, v + (p0.get(k) || 0));
		return merged;
	}

	bump (actor = null, delta = 1) {
		const { n, p } = COUNTERS.get(this);
		const map = (delta < 1) ? n : p;
		const number = Math.abs(delta) || 0;
		if (number) {
			const update = updateMap(map, actor, (value = 0) => value + number);
			this.emit('update', update, actor, delta);
		}
		return this;
	}

	get value () {
		const { n, p } = COUNTERS.get(this);
		return sumValues(p) - sumValues(n);
	}

	static fromJSON ({ n = {}, p = {} }) {
		const counter = new PNCounter();
		const { n: _n, p: _p } = COUNTERS.get(this);
		for (const key of Object.keys(n)) _n.set(key, n[key]);
		for (const key of Object.keys(p)) _p.set(key, p[key]);
		return counter;
	}

	static toJSON (anyPNCounter) {
		const { n, p } = COUNTERS.get(anyPNCounter);
		return { n: toObject(n), p: toObject(p), type: 'pn-counter' };
	}

}

const merge2 = (a, b) => a.merge(b); // "static"
Object.defineProperty(merge2, 'name', { value: 'merge' });

for (const T of [GCounter, PNCounter]) {
	T.prototype.inspect = function inspect () {
		/* istanbul ignore next */
		return T.toJSON(this);
	};
	Object.defineProperty(T, 'merge', { value: merge2 });
}

module.exports = { GCounter, PNCounter };
module.exports.default = module.exports;

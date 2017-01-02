/* eslint-env es6, node */
const { EventEmitter } = require('events');

const COUNTERS = new WeakMap(); // private

const isNormal = n => !Number.isNaN(n) && Number.isFinite(n) && !(n < Number.EPSILON);
const plusNormal = a => (b = 0) => (a + b); // curried version of +/2 for update(s)

const sumValues = (map, cached = map.sumCached) => {
	if (cached) return map.sum; // to avoid another sum
	let sum = 0; // valid as long as Map not mutated
	for (const value of map.values()) sum += value;
	Object.assign(map, { sum, sumCached: true });
	return sum;
};

const toObject = (map, object = {}) => {
	for (const [key, value] of map) {
		object[key] = value;
	}
	return object;
};

const updateMap = (map, key, update) => {
	const oldValue = map.get(key);
	const newValue = update(oldValue);
	map.set(key, newValue);
	map.sumCached = false;
	return [newValue, oldValue];
};

class GCounter extends EventEmitter {

	constructor () {
		super(); // mistake to inherit?
		COUNTERS.set(this, Object.freeze({ e: new Map() }));
	}

	update (delta = 1, actor = null) {
		const number = Number(delta);
		if (!isNormal(number)) {
			throw new Error('must #update with a normal (and positive) Number');
		}
		const { e } = COUNTERS.get(this);
		const update = updateMap(e, actor, plusNormal(number));
		this.emit('update', update, actor, delta);
		return this;
	}

	get value () {
		const { e } = COUNTERS.get(this);
		return sumValues(e);
	}

	static fromJSON ({ e: elements }) {
		const counter = new GCounter();
		const { e } = COUNTERS.get(counter);
		for (const key of Object.keys(elements)) {
			const number = Number(elements[key]);
			if (!isNormal(number)) {
				throw new Error(`the value for "${key}" is not a safe Number`);
			}
			e.set(key, number);
		}
		return counter;
	}

	static merge (first, second) {
		if (!(first instanceof GCounter) || !(second instanceof GCounter)) {
			throw new TypeError('each argument must be a GCounter');
		}
		const self = new GCounter();
		const { e: e0 } = COUNTERS.get(self);
		const { e: e1 } = COUNTERS.get(first);
		const { e: e2 } = COUNTERS.get(second);
		for (const [k, v] of e1) updateMap(e0, k, plusNormal(v));
		for (const [k, v] of e2) updateMap(e0, k, plusNormal(v));
		return self;
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

	update (delta = 1, actor = null) {
		const number = Number(delta);
		const abs = Math.abs(number);
		if (!isNormal(abs)) {
			throw new Error('must #update with a safe (any normal) Number');
		}
		const sign = Math.sign(number);
		const { n, p } = COUNTERS.get(this);
		const update = updateMap((sign === 1) ? p : n, actor, plusNormal(abs));
		this.emit('update', update, actor, delta);
		return this;
	}

	get value () {
		const { n, p } = COUNTERS.get(this);
		return sumValues(p) - sumValues(n);
	}

	static fromJSON ({ n: negatives, p: positives }) {
		const counter = new PNCounter();
		const { n, p } = COUNTERS.get(counter);
		for (const key of Object.keys(positives)) {
			const number = Number(positives[key]);
			if (!isNormal(number)) {
				throw new Error(`the value for "${key}" is not a safe Number`);
			}
			p.set(key, number);
		}
		for (const key of Object.keys(negatives)) {
			const number = Number(negatives[key]);
			if (!isNormal(number)) {
				throw new Error(`the value for "${key}" is not a safe Number`);
			}
			n.set(key, number);
		}
		return counter;
	}

	static merge (first, second) {
		if (!(first instanceof PNCounter) || !(second instanceof PNCounter)) {
			throw new TypeError('each argument must be a PNCounter');
		}
		const self = new PNCounter();
		const { n: n0, p: p0 } = COUNTERS.get(self);
		const { n: n1, p: p1 } = COUNTERS.get(first);
		const { n: n2, p: p2 } = COUNTERS.get(second);
		for (const [k, v] of n1) updateMap(n0, k, plusNormal(v));
		for (const [k, v] of n2) updateMap(n0, k, plusNormal(v));
		for (const [k, v] of p1) updateMap(p0, k, plusNormal(v));
		for (const [k, v] of p2) updateMap(p0, k, plusNormal(v));
		return self;
	}

	static toJSON (anyPNCounter) {
		const { n, p } = COUNTERS.get(anyPNCounter);
		return { n: toObject(n), p: toObject(p), type: 'pn-counter' };
	}

}

/* istanbul ignore next */
for (const T of [GCounter, PNCounter]) {
	T.prototype.inspect = function inspect () {
		return T.toJSON(this);
	};
	T.prototype.merge = function merge (other) {
		return T.merge(this, other);
	};
}

module.exports = { GCounter, PNCounter };
module.exports.default = module.exports;

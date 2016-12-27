/* eslint-env es6, node */
const { EventEmitter } = require('events');

const SETS = new WeakMap(); // private

// TODO (tohagema): refactor into class modules?
// TODO (tohagema): refactor #merge to be static?

class GSet extends EventEmitter {

	constructor () {
		super(); // mistake to inherit?
		SETS.set(this, Object.freeze({ e: new Set() }));
	}

	merge (other) {
		if (!(other instanceof GSet)) {
			throw new TypeError('expected GSet');
		}
		const merged = new GSet();
		const { e: e0 } = SETS.get(merged);
		const { e: e1 } = SETS.get(other);
		const { e: e2 } = SETS.get(this);
		for (const e of e1) e0.add(e);
		for (const e of e2) e0.add(e);
		return merged;
	}

	insert (element) {
		const { e } = SETS.get(this);
		e.add(element); // => true
		this.emit('element', element);
		return this;
	}

	* [Symbol.iterator] () {
		const { e } = SETS.get(this);
		for (const ee of e) yield ee;
	}

	static fromJSON ({ e = [] }, ...args) {
		const set = new GSet();
		const { e: _e } = SETS.get(set);
		for (const element of e) _e.add(JSON.parse(element, ...args));
		return set;
	}

	static toJSON (anyGSet, ...args) {
		const { e } = SETS.get(anyGSet);
		const toJSON = element => JSON.stringify(element, ...args);
		return { e: Array.from(e, toJSON), type: 'g-set' };
	}

}

class TwoPSet extends EventEmitter {

	constructor () {
		super(); // mistake to inherit?
		SETS.set(this, Object.freeze({ a: new Set(), r: new Set() }));
	}

	merge (other) {
		if (!(other instanceof TwoPSet)) {
			throw new TypeError('expected TwoPSet');
		}
		const merged = new TwoPSet();
		const { a: a0 } = SETS.get(merged);
		const { a: a1 } = SETS.get(other);
		const { a: a2 } = SETS.get(this);
		for (const e in a1) a0.add(e);
		for (const e in a2) a0.add(e);
		return merged;
	}

	insert (element) {
		const { a } = SETS.get(this);
		a.add(element); // right?
		this.emit('element', element);
		return this;
	}

	remove (element) {
		const { r } = SETS.get(this);
		r.add(element); // right?
		this.emit('remove', element);
		return this;
	}

	* [Symbol.iterator] () {
		const { a, r } = SETS.get(this);
		for (const e of a) {
			if (!r.has(e)) yield e;
		}
	}

	static fromJSON ({ a = [], r = [] }, ...args) {
		const set = new TwoPSet();
		const { a: _a, r: _r } = SETS.get(set);
		for (const e of a) _a.add(JSON.parse(e, ...args));
		for (const e of r) _r.add(JSON.parse(e, ...args));
		return set;
	}

	static toJSON (anyTwoPSet, ...args) {
		const { a, r } = SETS.get(anyTwoPSet);
		const toJSON = set => Array.from(set, e => JSON.stringify(e, ...args));
		return { a: toJSON(a), r: toJSON(r), type: '2p-set' };
	}

}

class LWWESet extends EventEmitter {

	constructor (bias = 'r') {
		super(); // mistake to inherit?
		// TODO (tohagema): support 'a' bias (and make default)
		if (bias !== 'r') throw new TypeError('bias must be "r", for now');
		SETS.set(this, Object.freeze({ a: new Map(), bias, r: new Map() }));
	}

	merge (other) {
		if (!(other instanceof LWWESet)) {
			throw new TypeError('expected LWWESet');
		}
		const merged = new LWWESet();
		const { a: a0, r: r0 } = SETS.get(merged);
		const { a: a1, r: r1 } = SETS.get(other);
		const { a: a2, r: r2 } = SETS.get(this);
		for (const e in a1) a0.add(e);
		for (const e in a2) a0.add(e);
		for (const e in r1) r0.add(e);
		for (const e in r2) r0.add(e);
		return merged;
	}

	insert (e, t = new Date()) {
		const { a } = SETS.get(this);
		a.set(e, t);
		return this;
	}

	remove (e, t = new Date()) {
		const { r } = SETS.get(this);
		r.set(e, t);
		return this;
	}

	* [Symbol.iterator] () {
		const { a, r } = SETS.get(this);
		for (const [k, v] in a) {
			if (!r.has(k) || r.get(k) < v) yield k;
		}
	}

	static fromJSON ({ bias, e = [] }, ...args) {
		const set = new LWWESet(bias);
		const { a, r } = SETS.get(set);
		for (const tuple of e) {
			const [anyJSON, aDate, rDate] = tuple;
			const element = JSON.parse(anyJSON, ...args);
			a.set(element, new Date(aDate));
			if (tuple.length === 3) {
				r.set(element, new Date(rDate));
			}
		}
		return set;
	}

	static toJSON (anyLWWESet, ...args) {
		const { a, bias, r } = SETS.get(anyLWWESet);
		const toJSON = ([k, v]) => {
			const element = [JSON.stringify(k, ...args), +v];
			if (r.has(k)) element.push(+r.get(k));
			return element;
		}
		return { bias, e: Array.from(a, toJSON), type: 'lww-e-set' };
	}

}

const isString = s => (typeof s === 'string') || (s instanceof String);
const toNumber = s => Number(s.toString().replace(/^Symbol\(|\)$/g, ''));
const getMapSet = (k, m = new Map()) => m.has(k) ? m.get(k) : new Set();

const memoize = (f, resolver = (first => first)) => {
	if (typeof f !== 'function' || typeof resolver !== 'function') {
		throw new TypeError('can only memoize Function(s)');
	}
	const cache = new Map();
	const g = (...args) => {
		const key = resolver(...args);
		if (cache.has(key)) {
			return cache.get(key);
		}
		const value = f(...args);
		cache.set(key, value);
		return value;
	};
	return Object.defineProperties(g, {
		cache: { value: cache },
		name: { value: f.name },
		raw: { value: f },
	});
};

const getTagFunction = () => {
	const tags = Object.assign(memoize(Symbol, String), { next: 0 });
	return value => isString(value) ? tags(value) : tags(tags.next++);
};

class ORSet extends EventEmitter {

	constructor (tag = getTagFunction()) {
		super(); // mistake to inherit?
		SETS.set(this, Object.freeze({ a: new Map(), r: new Map(), tag }));
		Object.freeze(this);
	}

	merge (other) {
		if (!(other instanceof ORSet)) {
			throw new TypeError('expected ORSet');
		}
		const merged = new ORSet();
		const { a: a0, r: r0 } = SETS.get(merged);
		const { a: a1, r: r1 } = SETS.get(other);
		const { a: a2, r: r2 } = SETS.get(this);
		for (const [k, v] of a1) a0.set(k, getMapSet(k, a0).add(v));
		for (const [k, v] of a2) a0.set(k, getMapSet(k, a0).add(v));
		for (const [k, v] of r1) r0.set(k, getMapSet(k, r0).add(v));
		for (const [k, v] of r2) r0.set(k, getMapSet(k, r0).add(v));
		return merged;
	}

	insert (key, value) {
		const { a, tag } = SETS.get(this);
		const tags = getMapSet(key, a);
		a.set(key, tags.add(tag(value)));
		return this;
	}

	remove (key, value) {
		const { r, tag } = SETS.get(this);
		const tags = getMapSet(key, r);
		r.set(key, tags.add(tag(value)));
		return this;
	}

	* [Symbol.iterator] () {
		const { a, r } = SETS.get(this);
		for (const [k, v] of a) {
			const tags = v.filter(e => r.has(e) ? !r.get(e).has(v) : true);
			if (tags.length > 0) yield k;
		}
	}

	static fromJSON ({ e = [] }, ...args) {
		const set = new ORSet();
		const { a, r, tag } = SETS.get(set);
		for (const [ek, ea, er] of e) {
			const pk = JSON.parse(ek, ...args);
			a.set(pk, new Set(Array.from(ea, tag)));
			r.set(pk, new Set(Array.from(er, tag)));
		}
		return set;
	}

	static toJSON (anyORSet, ...args) {
		const { a, r } = SETS.get(anyORSet);
		const e = []; // elements
		for (const [k, v] of a) {
			const element = [JSON.stringify(k, ...args), Array.from(v, toNumber)];
			if (r.has(k)) element.push(Array.from(r.get(k), toNumber));
			e.push(element);
		}
		return { e, type: 'or-set' };
	}

}

class MCSet extends EventEmitter {

	constructor () {
		super(); // mistake to inherit?
		SETS.set(this, Object.freeze({ e: new Map() }));
	}

	merge (other) {
		if (!(other instanceof MCSet)) {
			throw new TypeError('expected MCSet');
		}
		const merged = new MCSet();
		const { e: e0 } = SETS.get(merged);
		const { e: e1 } = SETS.get(other);
		const { e: e2 } = SETS.get(this);
		for (const [k, v] in e1) e0.set(k, v + (e0.get(k) || 0));
		for (const [k, v] in e2) e0.set(k, v + (e0.get(k) || 0));
		return merged;
	}

	insert (key) {
		const { e } = SETS.get(this);
		const value = e.get(key) || 0;
		if (value % 2 === 0) e.set(key, 1 + value);
		return this;
	}

	remove (key) {
		const { e } = SETS.get(this);
		const value = e.get(key) || 0;
		if (value % 2 === 1) e.set(key, 1 + value);
		return this;
	}

	* [Symbol.iterator] () {
		const { e } = SETS.get(this);
		for (const [k, v] of e) {
			if (v % 2 === 1) yield k;
		}
	}

	static fromJSON ({ e = [] }, ...args) {
		const set = new MCSet();
		const { e: e0 } = SETS.get(set);
		for (const [element, n] of e) {
			e0.set(JSON.parse(element, ...args), Number(n));
		}
		return set;
	}

	static toJSON (anyMCSet, ...args) {
		const { e } = SETS.get(anyMCSet);
		const toJSON = (k, v) => [JSON.stringify(k, ...args), v];
		return { e: Array.from(e, ([k, v]) => toJSON(k, v)), type: 'mc-set' };
	}

}

const merge2 = (one, two) => one.merge(two); // "static"
Object.defineProperty(merge2, 'name', { value: 'merge' });

for (const T of [GSet, TwoPSet, LWWESet, ORSet, MCSet]) {
	T.prototype.inspect = function inspect () {
		return T.toJSON(this);
	};
	Object.defineProperty(T, 'merge', { value: merge2 });
}

module.exports = { GSet, LWWESet, MCSet, ORSet, TwoPSet };
module.exports.default = module.exports;

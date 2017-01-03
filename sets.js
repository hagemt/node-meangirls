/* eslint-env es6, node */
const { EventEmitter } = require('events');

const SETS = new WeakMap(); // private

// TODO (tohagema): refactor into class modules?
// TODO (tohagema): implement get size uniformly?

const toJSON = (object, ...args) => {
	/* istanbul ignore else */
	if (typeof object !== 'object') return object;
	/* istanbul ignore next */
	return JSON.stringify(object, ...args);
};

class GSet extends EventEmitter {

	constructor (...elements) {
		super(); // mistake to inherit?
		SETS.set(this, Object.freeze({ e: new Set(elements) }));
	}

	contains (element) {
		const { e } = SETS.get(this);
		return e.has(element);
	}

	insert (element) {
		const { e } = SETS.get(this);
		this.emit('insert', element);
		e.add(element); // returns Set
		return this;
	}

	get size () {
		const { e } = SETS.get(this);
		return e.size;
	}

	* [Symbol.iterator] () {
		const { e } = SETS.get(this);
		yield* e[Symbol.iterator]();
	}

	static fromJSON ({ e }, ...args) {
		const set = new GSet();
		const { e: _e } = SETS.get(set);
		for (const element of e) _e.add(JSON.parse(element, ...args));
		return set;
	}

	static merge (first, second) {
		if (!(first instanceof GSet) || !(second instanceof GSet)) {
			throw new TypeError('expected GSet');
		}
		const self = new GSet();
		const { e: e0 } = SETS.get(self);
		const { e: e1 } = SETS.get(first);
		const { e: e2 } = SETS.get(second);
		for (const e of e1) e0.add(e);
		for (const e of e2) e0.add(e);
		return self;
	}

	static toJSON (anyGSet, ...args) {
		const { e } = SETS.get(anyGSet);
		const elements = Array.from(e, element => toJSON(element, ...args));
		return { e: elements, type: 'g-set' };
	}

}

class TwoPSet extends EventEmitter {

	constructor (...elements) {
		super(); // mistake to inherit?
		SETS.set(this, Object.freeze({ a: new Set(elements), r: new Set() }));
	}

	contains (element) {
		const { a, r } = SETS.get(this);
		return a.has(element) && !r.has(element);
	}

	insert (element) {
		const { a } = SETS.get(this);
		if (!a.has(element)) {
			this.emit('insert', element);
			a.add(element);
		}
		return this;
	}

	remove (element) {
		const { a, r } = SETS.get(this);
		if (a.has(element) && !r.has(element)) {
			this.emit('remove', element);
			r.add(element);
		}
		return this;
	}

	get size () {
		const { a, r } = SETS.get(this);
		return a.size - r.size;
	}

	* [Symbol.iterator] () {
		const { a, r } = SETS.get(this);
		for (const e of a) {
			if (!r.has(e)) yield e;
		}
	}

	static fromJSON ({ a, r }, ...args) {
		const set = new TwoPSet();
		const { a: _a, r: _r } = SETS.get(set);
		for (const e of a) _a.add(JSON.parse(e, ...args));
		for (const e of r) _r.add(JSON.parse(e, ...args));
		return set;
	}

	static merge (first, second) {
		if (!(first instanceof TwoPSet) || !(second instanceof TwoPSet)) {
			throw new TypeError('expected TwoPSet');
		}
		const self = new TwoPSet();
		const { a: a0, r: r0 } = SETS.get(self);
		const { a: a1, r: r1 } = SETS.get(first);
		const { a: a2, r: r2 } = SETS.get(second);
		for (const e of a1) a0.add(e);
		for (const e of a2) a0.add(e);
		for (const e of r1) r0.add(e);
		for (const e of r2) r0.add(e);
		return self;
	}

	static toJSON (anyTwoPSet, ...args) {
		const { a, r } = SETS.get(anyTwoPSet);
		const added = Array.from(a, e => toJSON(e, ...args));
		const removed = Array.from(r, e => toJSON(e, ...args));
		return { a: added, r: removed, type: '2p-set' };
	}

}

class LWWESet extends EventEmitter {

	constructor (options, ...elements) {
		super(); // mistake to inherit?
		// TODO (tohagema): support 'r' bias (allow specification)
		const { bias = 'a', zero = new Date() } = Object(options);
		if (bias !== 'a') throw new Error('bias must be "a", for now');
		const a = new Map(elements.map(e => [e, zero])); // value: ordered
		SETS.set(this, Object.freeze({ a, bias, r: new Map() }));
	}

	get bias () {
		const { bias } = SETS.get(this);
		return bias;
	}

	contains (key) {
		const { a, r } = SETS.get(this);
		if (!a.has(key)) return false;
		if (!r.has(key)) return true;
		return !(a.get(key) < r.get(key));
	}

	insert (key, value = new Date()) {
		const { a, r } = SETS.get(this);
		if (!a.has(key)) {
			this.emit('insert', [key, value], [a.get(key), r.get(key)]);
		}
		a.set(key, value);
		return this;
	}

	remove (key, value = new Date()) {
		const { a, r } = SETS.get(this);
		if (a.has(key)) {
			this.emit('remove', [key, value], [a.get(key), r.get(key)]);
			r.set(key, value);
		}
		return this;
	}

	* [Symbol.iterator] () {
		const { a, r } = SETS.get(this);
		for (const [k, v] of a) {
			if (!r.has(k) || !(v < r.get(k))) yield k;
		}
	}

	static fromJSON ({ bias, e }, ...args) {
		const set = new LWWESet({ bias });
		const { a, r } = SETS.get(set);
		const zero = new Date();
		for (const ee of e) {
			switch (Array.isArray(ee) ? ee.length : 0) {
			case 1:
				a.set(JSON.parse(ee[0], ...args), zero);
				break;
			case 2:
				a.set(JSON.parse(ee[0], ...args), new Date(ee[1]));
				break;
			case 3:
				a.set(JSON.parse(ee[0], ...args), new Date(ee[1]));
				r.set(JSON.parse(ee[0], ...args), new Date(ee[2]));
				break;
			default:
				throw new Error(`invalid element: ${ee}`);
			}
		}
		return set;
	}

	static merge (first, second) {
		if (!(first instanceof LWWESet) || !(second instanceof LWWESet)) {
			throw new TypeError('expected LWWESet');
		}
		const self = new LWWESet();
		const { a: a0, r: r0 } = SETS.get(self);
		const { a: a1, r: r1 } = SETS.get(first);
		const { a: a2, r: r2 } = SETS.get(second);
		for (const [k, v] of a1) a0.set(k, v);
		for (const [k, v] of r1) r0.set(k, v);
		for (const [k, v] of a2) {
			if (!(a0.has(k) && v < a0.get(k))) a0.set(k, v);
		}
		for (const [k, v] of r2) {
			if (!(r0.has(k) && v < r0.get(k))) r0.set(k, v);
		}
		return self;
	}

	static toJSON (anyLWWESet, ...args) {
		const { a, bias, r } = SETS.get(anyLWWESet);
		const elements = []; // "e"
		for (const [k, v] of a) {
			const ee = [toJSON(k, ...args), +v];
			if (r.has(k)) ee.push(+r.get(k));
			elements.push(ee);
		}
		return { bias, e: elements, type: 'lww-e-set' };
	}

}

const getMapSet = (k, m = new Map()) => m.has(k) ? m.get(k) : new Set();
const isString = s => (typeof s === 'string') || (s instanceof String);
const tagString = s => s.toString().replace(/^Symbol\(|\)$/g, '');

const memoize = (f, resolver) => {
	const cache = new Map();
	const g = (...args) => {
		const key = resolver(...args);
		/* istanbul ignore next */
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
	});
};

const tagFunction = () => {
	const tag = Object.assign(memoize(Symbol, String), { next: 0 });
	return any => isString(any) ? tag(any) : tag(tag.next++);
};

class ORSet extends EventEmitter {

	constructor (options, ...elements) {
		super(); // mistake to inherit?
		const { tag = tagFunction(), zero = tag() } = Object(options);
		const a = new Map(elements.map(e => [e, new Set([zero])]));
		SETS.set(this, Object.freeze({ a, r: new Map(), tag }));
	}

	contains (key) {
		const { a, r } = SETS.get(this);
		if (!a.has(key)) return false;
		if (!r.has(key)) return true;
		const [aSet, rSet] = [a.get(key), r.get(key)];
		return !Array.from(aSet).every(tag => rSet.has(tag));
	}

	insert (element, ...args) {
		const { a, r, tag } = SETS.get(this);
		const [aSet, rSet] = [getMapSet(element, a), getMapSet(element, r)];
		const tags = (args.length === 0) ? [tag()] : args.map(tag);
		if (!tags.every(tag => aSet.has(tag))) {
			const [aSymbols, rSymbols] = [Array.from(aSet), Array.from(rSet)];
			this.emit('insert', [element, ...tags], [aSymbols, rSymbols]);
			for (const tag of tags) aSet.add(tag);
			a.set(element, aSet);
		}
		return this;
	}

	remove (element, ...args) {
		const { a, r, tag } = SETS.get(this);
		const [aSet, rSet] = [getMapSet(element, a), getMapSet(element, r)];
		const tags = (args.length === 0) ? Array.from(aSet) : args.map(tag);
		if (tags.length > 0 && !tags.every(tag => rSet.has(tag))) {
			const [aSymbols, rSymbols] = [Array.from(aSet), Array.from(rSet)];
			this.emit('remove', [element, ...tags], [aSymbols, rSymbols]);
			for (const tag of tags) rSet.add(tag);
			r.set(element, rSet);
		}
		return this;
	}

	* [Symbol.iterator] () {
		const { a, r } = SETS.get(this);
		for (const [element, aSet] of a) {
			const rSet = getMapSet(element, r); // => Set (possibly empty)
			const removed = Array.from(aSet).every(tag => rSet.has(tag));
			if (!removed) yield element;
		}
	}

	static fromJSON ({ e }, ...args) {
		const set = new ORSet();
		const { a, r, tag } = SETS.get(set);
		const zero = tag();
		for (const ee of e) {
			switch (Array.isArray(ee) ? ee.length : 0) {
			case 1:
				a.set(JSON.parse(ee[0], ...args), new Set([zero]));
				break;
			case 2:
				a.set(JSON.parse(ee[0], ...args), new Set(Array.from(ee[1], tag)));
				break;
			case 3:
				a.set(JSON.parse(ee[0], ...args), new Set(Array.from(ee[1], tag)));
				r.set(JSON.parse(ee[0], ...args), new Set(Array.from(ee[2], tag)));
				break;
			default:
				throw new Error(`invalid element: ${ee}`);
			}
		}
		return set;
	}

	static merge (first, second) {
		if (!(first instanceof ORSet) || !(second instanceof ORSet)) {
			throw new TypeError('expected ORSet');
		}
		const self = new ORSet();
		const { a: a0, r: r0 } = SETS.get(self);
		const { a: a1, r: r1 } = SETS.get(first);
		const { a: a2, r: r2 } = SETS.get(second);
		for (const [k, v] of a1) a0.set(k, new Set(v));
		for (const [k, v] of r1) r0.set(k, new Set(v));
		for (const [k, v] of a2) {
			const aSet = getMapSet(k, a0);
			for (const s of v) aSet.add(s);
			a0.set(k, aSet);
		}
		for (const [k, v] of r2) {
			const rSet = getMapSet(k, r0);
			for (const s of v) rSet.add(s);
			r0.set(k, rSet);
		}
		return self;
	}

	static toJSON (anyORSet, ...args) {
		const { a, r } = SETS.get(anyORSet);
		const elements = []; // "e"
		for (const [k, v] of a) {
			const ee = [toJSON(k, ...args), Array.from(v, tagString)];
			if (r.has(k)) ee.push(Array.from(r.get(k), tagString));
			elements.push(ee);
		}
		return { e: elements, type: 'or-set' };
	}

}

class MCSet extends EventEmitter {

	constructor (...elements) {
		super(); // mistake to inherit?
		const e = new Map(elements.map(e => ([e, 1])));
		SETS.set(this, Object.freeze({ e }));
	}

	contains (element) {
		const { e } = SETS.get(this);
		return e.has(element) && (e.get(element) % 2 === 1);
	}

	insert (element) {
		const { e } = SETS.get(this);
		const number = e.get(element) || 0;
		if (number % 2 === 0) {
			this.emit('insert', element);
			e.set(element, 1 + number);
		}
		return this;
	}

	remove (element) {
		const { e } = SETS.get(this);
		const number = e.get(element) || 0;
		if (number % 2 === 1) {
			this.emit('remove', element);
			e.set(element, 1 + number);
		}
		return this;
	}

	* [Symbol.iterator] () {
		const { e } = SETS.get(this);
		for (const [element, number] of e) {
			if (number % 2 === 1) yield element;
		}
	}

	static fromJSON ({ e }, ...args) {
		const set = new MCSet();
		const { e: e0 } = SETS.get(set);
		for (const [element, n] of e) {
			if (!(Number.isInteger(n) && n > 0)) {
				throw new Error('expected positive Integer');
			}
			e0.set(JSON.parse(element, ...args), n);
		}
		return set;
	}

	static merge (first, second) {
		if (!(first instanceof MCSet) || !(second instanceof MCSet)) {
			throw new TypeError('expected MCSet');
		}
		const self = new MCSet();
		const { e: e0 } = SETS.get(self);
		const { e: e1 } = SETS.get(first);
		const { e: e2 } = SETS.get(second);
		for (const [element, n] of e1) {
			e0.set(element, n + (e0.get(element) || 0));
		}
		for (const [element, n] of e2) {
			e0.set(element, n + (e0.get(element) || 0));
		}
		return self;
	}

	static toJSON (anyMCSet, ...args) {
		const { e } = SETS.get(anyMCSet);
		const elements = Array.from(e, ([k, v]) => [toJSON(k, ...args), v]);
		return { e: elements, type: 'mc-set' };
	}

}

/* istanbul ignore next */
for (const T of [GSet, TwoPSet, LWWESet, ORSet, MCSet]) {
	T.prototype.inspect = function inspect () {
		return T.toJSON(this);
	};
	T.prototype.merge = function merge (other) {
		return T.merge(this, other);
	};
}

module.exports = { GSet, LWWESet, MCSet, ORSet, TwoPSet };
module.exports.default = module.exports;

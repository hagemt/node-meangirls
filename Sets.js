/* eslint-env es6, node */
const { EventEmitter } = require('events');

const SETS = new WeakMap();

class GSet extends EventEmitter {

	constructor () {
		super(); // mistake to inherit?
		SETS.set(this, { e: new Set() });
	}

	add (element) {
		const { e } = SETS.get(this);
		e.add(element); // right?
		this.emit('add', element);
		return this;
	}

	inspect () {
		const { e } = SETS.get(this);
		return { e: [...e], type: 'g-set' };
	}

	get values () {
		const { e } = SETS.get(this);
		return new Set(e);
	}

}

class TwoPSet extends EventEmitter {

	constructor () {
		super(); // mistake to inherit?
		SETS.set(this, { a: new Set(), r: new Set() });
	}

	add (element) {
		const { a } = SETS.get(this);
		a.add(element); // right?
		this.emit('add', element);
		return this;
	}

	inspect () {
		const { a, r } = SETS.get(this);
		return { a: [...a], r: [...r], type: '2p-set' };
	}

	remove (element) {
		const { r } = SETS.get(this);
		r.add(element); // right?
		this.emit('remove', element);
		return this;
	}

	get values () {
		const { a, r } = SETS.get(this);
		return new Set([...a].filter(e => !r.has(e)));
	}

}

module.exports = { GSet, TwoPSet };
module.exports.default = module.exports;

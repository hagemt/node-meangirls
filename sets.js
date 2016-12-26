/* eslint-env es6, node */
const { EventEmitter } = require('events');

const SETS = new WeakMap(); // private

class GSet extends EventEmitter {

	constructor () {
		super(); // mistake to inherit?
		SETS.set(this, Object.freeze({ e: new Set() }));
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

	* [Symbol.iterator] () {
		const { e } = SETS.get(this);
		for (const ee of e) yield ee;
	}

}

class TwoPSet extends EventEmitter {

	constructor () {
		super(); // mistake to inherit?
		SETS.set(this, Object.freeze({ a: new Set(), r: new Set() }));
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

	* [Symbol.iterator] () {
		const { a, r } = SETS.get(this);
		for (const e of a) {
			if (!r.has(e)) yield e;
		}
	}

}

// TODO (tohagema): implement these sets, similarly:
// https://github.com/aphyr/meangirls#lww-element-set
// https://github.com/aphyr/meangirls#or-set
// https://github.com/aphyr/meangirls#max-change-sets

module.exports = { GSet, TwoPSet };
module.exports.default = module.exports;

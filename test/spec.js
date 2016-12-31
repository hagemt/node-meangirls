/* eslint-env es6, mocha, node */
const assert = require('assert');
const meangirls = require('..');

describe('meangirls', () => {

	it('is a library for CRDTs', () => {
		assert(meangirls);
	});

	describe('merge', () => {

		it('can join two or more GCounters', () => {
			const c1 = new meangirls.GCounter();
			const c2 = new meangirls.GCounter();
			const c3 = new meangirls.GCounter();
			const c0 = meangirls.merge(c1, c2, c3);
			c0.should.be.instanceof(meangirls.GCounter);
		});

		it('can join two or more PNCounters', () => {
			const c1 = new meangirls.PNCounter();
			const c2 = new meangirls.PNCounter();
			const c3 = new meangirls.PNCounter();
			const c0 = meangirls.merge(c1, c2, c3);
			c0.should.be.instanceof(meangirls.PNCounter);
		});

		it('throws if passed fewer than two arguments', () => {
			(() => meangirls.merge()).should.throw();
			(() => meangirls.merge(null)).should.throw();
		});

		it('throws if passed counters of mismatched type', () => {
			const g = new meangirls.GCounter();
			const pn = new meangirls.PNCounter();
			(() => meangirls.merge(g, pn)).should.throw();
		});

	});

	describe('parse', () => {

		it('can obtain a GCounter from JSON', () => {
			const counter = meangirls.parse({
				e: {}, // empty
				type: 'g-counter',
			});
			counter.should.be.instanceof(meangirls.GCounter);
		});

		it('can obtain a PNCounter from JSON', () => {
			const counter = meangirls.parse({
				p: {}, // empty
				n: {}, // empty
				type: 'pn-counter',
			});
			counter.should.be.instanceof(meangirls.PNCounter);
		});

		it('throws TypeError if passed invalid JSON', () => {
			(() => meangirls.parse(/* null */)).should.throw(TypeError);
			(() => meangirls.parse({ type: 'unknown' })).should.throw(TypeError);
		});

	});

});

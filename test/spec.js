/* eslint-env es6, mocha, node */
const assert = require('assert');
const meangirls = require('..');

describe('meangirls', () => {

	it('is a library for CRDTs', () => {
		assert(meangirls);
	});

	describe('merge', () => {

		const gc = new meangirls.GCounter();
		const pn = new meangirls.PNCounter();

		const gs = new meangirls.GSet();

		it('can join two or more GCounters', () => {
			const one = new meangirls.GCounter().update();
			const two = new meangirls.GCounter().update();
			const result = meangirls.merge(gc, one, two);
			result.should.be.instanceof(meangirls.GCounter);
		});

		it('can join two or more PNCounters', () => {
			const one = new meangirls.PNCounter().update();
			const two = new meangirls.PNCounter().update();
			const result = meangirls.merge(pn, one, two);
			result.should.be.instanceof(meangirls.PNCounter);
		});

		it('can join two or more GSets', () => {
			const one = new meangirls.GSet().insert(1);
			const two = new meangirls.GSet().insert(2);
			const result = meangirls.merge(gs, one, two);
			result.should.be.instanceof(meangirls.GSet);
		});

		it('throws if passed not exactly one kind of CRDT', () => {
			(() => meangirls.merge()).should.throw();
			(() => meangirls.merge(null)).should.throw();
			(() => meangirls.merge(null, gs)).should.throw();
			(() => meangirls.merge(gc, pn, gs)).should.throw();
		});

		it('does nothing to a single CRDT', () => {
			meangirls.merge(gc).should.equal(gc);
			meangirls.merge(pn).should.equal(pn);
			meangirls.merge(gs).should.equal(gs);
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

		it('can obtain a GSet from JSON', () => {
			const set = meangirls.parse({
				e: [], // empty
				type: 'g-set',
			});
			set.should.be.instanceof(meangirls.GSet);
		});

		it('can obtain a TwoPSet from JSON', () => {
			const set = meangirls.parse({
				a: [], // empty
				r: [], // empty
				type: '2p-set',
			});
			set.should.be.instanceof(meangirls.TwoPSet);
		});

		it('can obtain an LWWESet from JSON', () => {
			const set = meangirls.parse({
				e: [], // empty
				type: 'lww-e-set',
			});
			set.should.be.instanceof(meangirls.LWWESet);
		});

		it('can obtain an ORSet from JSON', () => {
			const set = meangirls.parse({
				e: [], // empty
				type: 'or-set',
			});
			set.should.be.instanceof(meangirls.ORSet);
		});

		it('can obtain an MCSet from JSON', () => {
			const set = meangirls.parse({
				e: [], // empty
				type: 'mc-set',
			});
			set.should.be.instanceof(meangirls.MCSet);
		});

		it('throws TypeError if passed invalid JSON', () => {
			(() => meangirls.parse(/* null */)).should.throw(TypeError);
			(() => meangirls.parse({ type: 'unknown' })).should.throw(TypeError);
		});

	});

});

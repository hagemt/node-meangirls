/* eslint-env es6, mocha, node */
const meangirls = require('..')

describe('Global module exports', function () {
	describe('meangirls.merge', function () {
		const test = {}
		before(function () {
			test.gc = new meangirls.GCounter()
			test.pn = new meangirls.PNCounter()

			test.gs = new meangirls.GSet()
		})

		it('can join two or more GCounters', function () {
			const one = new meangirls.GCounter().update()
			const two = new meangirls.GCounter().update()
			const result = meangirls.merge(test.gc, one, two)
			result.should.be.instanceof(meangirls.GCounter)
		})

		it('can join two or more PNCounters', function () {
			const one = new meangirls.PNCounter().update()
			const two = new meangirls.PNCounter().update()
			const result = meangirls.merge(test.pn, one, two)
			result.should.be.instanceof(meangirls.PNCounter)
		})

		it('can join two or more GSets', function () {
			const one = new meangirls.GSet().insert(1)
			const two = new meangirls.GSet().insert(2)
			const result = meangirls.merge(test.gs, one, two)
			result.should.be.instanceof(meangirls.GSet)
		})

		it('throws if passed not exactly one kind of CRDT', function () {
			;(() => meangirls.merge()).should.throw()
			;(() => meangirls.merge(null)).should.throw()
			;(() => meangirls.merge(null, test.gs)).should.throw()
			;(() => meangirls.merge(test.gc, test.pn, test.gs)).should.throw()
		})
	})

	describe('meangirls.parse', function () {
		it('can obtain a GCounter from JSON', function () {
			const counter = meangirls.parse({
				e: {}, // empty
				type: 'g-counter',
			})
			counter.should.be.instanceof(meangirls.GCounter)
		})

		it('can obtain a PNCounter from JSON', function () {
			const counter = meangirls.parse({
				p: {}, // empty
				n: {}, // empty
				type: 'pn-counter',
			})
			counter.should.be.instanceof(meangirls.PNCounter)
		})

		it('can obtain a GSet from JSON', function () {
			const set = meangirls.parse({
				e: [], // empty
				type: 'g-set',
			})
			set.should.be.instanceof(meangirls.GSet)
		})

		it('can obtain a TwoPSet from JSON', function () {
			const set = meangirls.parse({
				a: [], // empty
				r: [], // empty
				type: '2p-set',
			})
			set.should.be.instanceof(meangirls.TwoPSet)
		})

		it('can obtain an LWWESet from JSON', function () {
			const set = meangirls.parse({
				e: [], // empty
				type: 'lww-e-set',
			})
			set.should.be.instanceof(meangirls.LWWESet)
		})

		it('can obtain an ORSet from JSON', function () {
			const set = meangirls.parse({
				e: [], // empty
				type: 'or-set',
			})
			set.should.be.instanceof(meangirls.ORSet)
		})

		it('can obtain an MCSet from JSON', function () {
			const set = meangirls.parse({
				e: [], // empty
				type: 'mc-set',
			})
			set.should.be.instanceof(meangirls.MCSet)
		})

		it('throws TypeError if passed invalid JSON', function () {
			;(() => meangirls.parse(/* null */)).should.throw(TypeError)
			;(() => meangirls.parse({ type: 'unknown' })).should.throw(TypeError)
		})
	})
})

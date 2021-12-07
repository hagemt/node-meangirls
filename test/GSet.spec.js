/* eslint-env es6, mocha, node */
const { GSet } = require('../sets')

describe('GSet', function () {
	describe('constructor', function () {
		it('creates a Set-like Object', function () {
			new GSet().should.have.property('size', 0)
			const array = Array.from({ length: 10 }, (_, i) => i)
			Array.from(new GSet(...array)).should.deepEqual(array)
		})
	})

	describe('#contains', function () {
		it('returns true/false, indicating set membership', function () {
			const set = new GSet(1) // singleton
			set.contains(1).should.equal(true)
			set.contains(0).should.equal(false)
		})
	})

	describe('#insert', function () {
		it('adds an element and returns the set modified', function () {
			const set = new GSet()
			set.insert(0).should.equal(set)
			set.should.have.property('size', 1)
			set.insert(1).should.have.property('size', 2)
			set.insert(1).should.have.property('size', 2)
			set.insert(2).should.have.property('size', 3)
			Array.from(set).should.deepEqual([0, 1, 2])
		})
	})

	describe('#remove', function () {
		it('throws if and only if the GSet contains said element', function () {
			const set = new GSet(1) // singleton
			set.remove(0).should.equal(set) // no-op
			;(() => set.remove(1)).should.throw()
		})
	})

	describe('static', function () {
		describe('fromJSON', function () {
			it('returns a GSet from JSON', function () {
				const elements = Array.from({ length: 10 }, (_, i) => i)
				const set = GSet.fromJSON({ e: elements })
				set.should.be.instanceof(GSet)
				set.should.have.property('size', 10)
				Array.from(set).should.deepEqual(elements)
			})
		})

		describe('toJSON', function () {
			it('returns JSON from a GSet', function () {
				const elements = Array.from({ length: 10 }, (_, i) => i)
				const json = GSet.toJSON(new GSet(...elements))
				json.should.be.instanceof(Object)
				json.should.deepEqual({ e: elements, type: 'g-set' })
			})
		})

		describe('merge', function () {
			it('returns a new GSet that combines two GSets', function () {
				const one = new GSet(1) // singleton
				const two = new GSet(2) // singleton
				const three = GSet.merge(one, two)
				three.should.be.instanceof(GSet)
				three.should.have.property('size', 2)
				Array.from(three).should.deepEqual([1, 2])
			})

			it('throws an Error if passed any non-GSet', function () {
				const set = new GSet()
				;(() => GSet.merge(set, null)).should.throw()
				;(() => GSet.merge(null, set)).should.throw()
			})
		})

		it('enables use of JSON as a wire protocol', function () {
			const elements = Array.from({ length: 10 }, (_, i) => i)
			const json = { e: elements, type: 'g-set' } // holds 0-9
			GSet.toJSON(GSet.fromJSON(json)).should.deepEqual(json)
		})
	})
})

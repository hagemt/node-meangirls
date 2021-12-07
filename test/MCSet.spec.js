/* eslint-env es6, mocha, node */
const { MCSet } = require('../sets')

describe('MCSet', function () {
	describe('constructor', function () {
		it('creates an empty Set-like Object', function () {
			Array.from(new MCSet()).should.deepEqual([])
		})

		it('acts very similar to the Set constructor', function () {
			const array = Array.from({ length: 10 }, (_, i) => i)
			Array.from(new MCSet(...array)).should.deepEqual(array)
		})
	})

	describe('#contains', function () {
		it('determines set membership', function () {
			const set = new MCSet(0) // singleton
			set.contains(0).should.equal(true)
			set.contains(1).should.equal(false)
		})
	})

	describe('#insert', function () {
		it('adds elements to the set', function () {
			const set = new MCSet()
			Array.from(set).should.deepEqual([])
			set.insert(0).should.equal(set)
			Array.from(set).should.deepEqual([0])
			set.insert(0).insert(1)
			Array.from(set).should.deepEqual([0, 1])
		})
	})

	describe('#remove', function () {
		it('removes elements from a set', function () {
			const set = new MCSet(0, 1)
			Array.from(set).should.deepEqual([0, 1])
			set.remove(0).should.equal(set)
			Array.from(set).should.deepEqual([1])
			set.remove(0).remove(1).remove(2)
			Array.from(set).should.deepEqual([])
		})
	})

	describe('static', function () {
		describe('fromJSON', function () {
			it('returns a new MCSet from JSON', function () {
				const elements = Array.from({ length: 10 }, (_, i) => i)
				const json = { e: elements.map((e) => [e, 1]), type: 'mc-set' }
				const set = MCSet.fromJSON(json)
				set.should.be.instanceof(MCSet)
				Array.from(set).should.deepEqual(elements)
			})

			it('will throw if given invalid JSON', function () {
				const invalid = [[0, 1 / 2]] // non-Integer count
				;(() => MCSet.fromJSON({ e: invalid })).should.throw()
			})
		})

		describe('merge', function () {
			it('combines two MCSets, returning a new MCSet', function () {
				const one = new MCSet(1) // singleton
				const two = new MCSet(2) // singleton
				const three = MCSet.merge(one, two)
				three.should.be.instanceof(MCSet)
				Array.from(three).should.deepEqual([1, 2])
			})

			it('throws if either argument is not an MCSet', function () {
				const set = new MCSet()
				;(() => MCSet.merge(set, null)).should.throw()
				;(() => MCSet.merge(null, set)).should.throw()
			})
		})

		describe('toJSON', function () {
			it('returns JSON from an MCSet', function () {
				const elements = Array.from({ length: 10 }, (_, i) => i)
				const json = MCSet.toJSON(new MCSet(...elements))
				json.should.be.instanceof(Object)
				const e = elements.map((e) => [e, 1])
				json.should.deepEqual({ e, type: 'mc-set' })
			})
		})

		it('enables use of JSON as a wire protocol', function () {
			const elements = Array.from({ length: 10 }, (_, i) => i)
			const json = { e: elements.map((e) => [e, 1]), type: 'mc-set' }
			MCSet.toJSON(MCSet.fromJSON(json)).should.deepEqual(json)
		})
	})
})

/* eslint-env es6, mocha, node */
const { ORSet } = require('../sets')

describe('ORSet', function () {
	describe('constructor', function () {
		it('creates an empty Set-like object', function () {
			Array.from(new ORSet()).should.deepEqual([])
		})
	})

	describe('#contains', function () {
		it('determines set membership', function () {
			const set = new ORSet(null, 0).insert(1).remove(1)
			set.contains(0).should.equal(true)
			set.contains(1).should.equal(false)
			set.contains(2).should.equal(false)
		})
	})

	describe('#insert', function () {
		it('updates set membership', function () {
			const set = new ORSet()
			Array.from(set).should.deepEqual([])
			set.insert(0).should.equal(set)
			Array.from(set).should.deepEqual([0])
		})

		it('supports multiple tags', function () {
			const set = new ORSet()
			set.insert(0, 'a') // tag: Symbol(0)
			Array.from(set).should.deepEqual([0])
			set.insert(0, 'b') // tag: Symbol(1)
			Array.from(set).should.deepEqual([0])
		})
	})

	describe('#remove', function () {
		it('updates set membership', function () {
			const set = new ORSet(null, 0)
			Array.from(set).should.deepEqual([0])
			set.remove(0).should.equal(set)
			Array.from(set).should.deepEqual([])
		})

		it('supports multiple tags', function () {
			const set = new ORSet(null, 0).insert(1, 'a').insert(1, 'a')
			set.remove(0).remove(1, 'a').remove(2)
			Array.from(set).should.deepEqual([])
		})
	})

	describe('static', function () {
		describe('fromJSON', function () {
			it('converts JSON into a new ORSet', function () {
				const set = ORSet.fromJSON({
					e: [[0], [1, ['a']], [2, ['a'], ['a']], [3, ['a', 'b'], ['b', 'c']]],
					type: 'or-set',
				})
				set.should.be.instanceof(ORSet)
				Array.from(set).should.deepEqual([0, 1, 3])
			})

			it('will throw, if the JSON is invalid', function () {
				const invalid = (e = null) => ({ e, type: 'or-set' })
				;(() => ORSet.fromJSON(invalid())).should.throw()
				;(() => ORSet.fromJSON(invalid([[]]))).should.throw()
				;(() => ORSet.fromJSON(invalid([null]))).should.throw()
			})
		})

		describe('merge', function () {
			it('combines exactly two ORSets', function () {
				const one = new ORSet().insert(1).remove(1)
				const two = new ORSet().insert(2).remove(2)
				const three = ORSet.merge(null, one, two)
				three.should.be.instanceof(ORSet)
				Array.from(three).should.deepEqual([])
			})

			it('throws if either argument is not an ORSet', function () {
				const set = new ORSet()
				;(() => ORSet.merge(null, set, null)).should.throw()
				;(() => ORSet.merge(null, null, set)).should.throw()
			})
		})

		describe('toJSON', function () {
			it('converts a ORSet into JSON', function () {
				const elements = Array.from({ length: 10 }, (_, i) => i)
				const set = new ORSet(null, ...elements)
				for (const e of elements) set.remove(e)
				const json = ORSet.toJSON(set)
				json.should.be.instanceof(Object)
				const e = elements.map((e) => [e, ['0'], ['0']])
				json.should.deepEqual({ e, type: 'or-set' })
			})
		})

		it('enables use of JSON as a wire protocol', function () {
			const elements = Array.from({ length: 10 }, (_, i) => i)
			const json = ORSet.toJSON(new ORSet(null, ...elements))
			Array.from(ORSet.fromJSON(json)).should.deepEqual(elements)
		})
	})
})

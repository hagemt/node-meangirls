/* eslint-env es6, mocha, node */
const { LWWESet } = require('../sets')

describe('LWWESet', function () {
	describe('constructor', function () {
		it('creates an empty Set-like object', function () {
			Array.from(new LWWESet()).should.deepEqual([])
		})

		it('perfers additions (a) over removals (r)', function () {
			new LWWESet().should.have.property('bias', 'a')
			;(() => new LWWESet({ bias: 'r' })).should.throw()
		})

		it('can also be built from options and an initializer list', function () {
			const options = { bias: 'a', zero: new Date() } // defaults
			const elements = Array.from({ length: 10 }, (_, i) => i)
			const set = new LWWESet(options, ...elements)
			Array.from(set).should.deepEqual(elements)
		})
	})

	describe('#contains', function () {
		it('determines set membership', function () {
			new LWWESet().contains(0).should.equal(false) // never added, nor removed
			const options = { zero: new Date(0) } // use default bias, custom zero point
			new LWWESet(null, 0).contains(0).should.equal(true) // default zero: new Date()
			new LWWESet(options, 0)
				.remove(0, options.zero)
				.contains(0)
				.should.equal(true)
			new LWWESet(options, 0)
				.remove(0, new Date(1))
				.contains(0)
				.should.equal(false)
		})
	})

	describe('#insert', function () {
		it('updates set membership', function () {
			const set = new LWWESet(null, 0)
			set.insert(0).insert(1).should.equal(set)
			Array.from(set).should.deepEqual([0, 1])
		})
	})

	describe('#remove', function () {
		it('updates set membership', function () {
			const options = { zero: new Date(0) }
			const set = new LWWESet(options, 0, 1).remove(1, new Date(1))
			set.remove(2).should.equal(set) // set remains singleton
			Array.from(set).should.deepEqual([0])
		})
	})

	describe('static', function () {
		describe('fromJSON', function () {
			it('converts JSON into a new LWWESet', function () {
				const elements = Array.from({ length: 10 }, (_, i) => i)
				const e = elements.map((e) => [e]) // added at same t=zero
				const set = LWWESet.fromJSON({ bias: 'a', e, type: 'lww-e-set' })
				Array.from(set).should.deepEqual(elements)
			})

			it('properly handles additions and removals', function () {
				const e = [
					[0, 0, 0],
					[1, 1, 2],
					[2, 2, 1],
				]
				const set = LWWESet.fromJSON({ bias: 'a', e, type: 'lww-e-set' })
				Array.from(set).should.deepEqual([0, 2])
			})

			it('will throw if given invalid JSON', function () {
				const [bias, type] = ['a', 'lww-e-set'] // valid
				const invalid = (e = null) => ({ bias, e, type })
				;(() => LWWESet.fromJSON(invalid())).should.throw()
				;(() => LWWESet.fromJSON(invalid([[]]))).should.throw()
				;(() => LWWESet.fromJSON(invalid([null]))).should.throw()
			})
		})

		describe('merge', function () {
			it('combines exactly two LWWESets', function () {
				const options = { zero: new Date(0) }
				const one = new LWWESet(options, 1)
				const two = new LWWESet(options, 2)
				const three = LWWESet.merge(null, one, two)
				three.should.be.instanceof(LWWESet)
				Array.from(three).should.deepEqual([1, 2])
			})

			it('properly handles additions and removals', function () {
				const options = { zero: new Date(0) }
				const one = new LWWESet(options, 1, 2).remove(2, new Date(0))
				const two = new LWWESet(options, 1).remove(1, new Date(1))
				Array.from(LWWESet.merge(null, one, two)).should.deepEqual([2])
			})

			it('follows last-write-wins sematics', function () {
				const one = new LWWESet({ zero: new Date(1) }, 0)
				const two = new LWWESet({ zero: new Date(0) }, 0)
				one.remove(0, new Date(1)).contains(0).should.equal(true)
				two.remove(0, new Date(2)).contains(0).should.equal(false)
				LWWESet.merge(null, one, two).contains(0).should.equal(false)
				LWWESet.merge(null, two, one).contains(0).should.equal(false)
			})

			it('throws if either argument is not an LWWESet', function () {
				const set = new LWWESet()
				;(() => LWWESet.merge(null, set, null)).should.throw()
				;(() => LWWESet.merge(null, null, set)).should.throw()
			})
		})

		describe('toJSON', function () {
			it('converts a LWWESet into JSON', function () {
				const set = new LWWESet()
				set.insert(0, new Date(0))
				set.remove(0, new Date(0))
				const json = LWWESet.toJSON(set)
				json.should.be.instanceof(Object)
				const e = [[0, 0, 0]] // both added and removed 0 at t=0
				json.should.deepEqual({ bias: 'a', e, type: 'lww-e-set' })
			})
		})

		it('enables use of JSON as a wire protocol', function () {
			const elements = Array.from({ length: 10 }, (_, i) => i)
			const e = elements.map((e) => [e, +new Date()])
			const json = { bias: 'a', e, type: 'lww-e-set' }
			LWWESet.toJSON(LWWESet.fromJSON(json)).should.deepEqual(json)
		})
	})
})

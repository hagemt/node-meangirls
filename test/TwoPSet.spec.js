/* eslint-env es6, mocha, node */
const { TwoPSet } = require('../sets');

describe('TwoPSet', () => {

	describe('constructor', () => {

		it('creates an empty Set-like Object', () => {
			new TwoPSet().should.have.property('size', 0);
			const elements = Array.from({ length: 10 }, (_, i) => i);
			const set = new TwoPSet(...elements);
			set.should.have.property('size', elements.length);
			Array.from(set).should.deepEqual(elements);
		});

	});

	describe('#contains', () => {

		it('determines set membership', () => {
			const set = new TwoPSet(0); // singleton
			set.contains(0).should.equal(true);
			set.contains(1).should.equal(false);
		});

	});

	describe('#insert', () => {

		it('add an element to the set', () => {
			const set = new TwoPSet();
			set.insert(0).should.equal(set);
			set.should.have.property('size', 1);
			set.insert(1).should.have.property('size', 2);
			set.insert(1).should.have.property('size', 2);
			set.insert(2).should.have.property('size', 3);
			Array.from(set).should.deepEqual([0, 1, 2]);
		});

	});

	describe('#remove', () => {

		it('removes an element from the set', () => {
			const set = new TwoPSet();
			set.remove(0).should.equal(set);
			set.should.have.property('size', 0);
			set.insert(0);
			set.should.have.property('size', 1);
			set.remove(0);
			set.should.have.property('size', 0);
		});

	});

	describe('static', () => {

		describe('toJSON', () => {

			it('returns JSON', () => {
				const set = new TwoPSet(1, 2).remove(1);
				const json = TwoPSet.toJSON(set);
				json.should.be.instanceof(Object);
				json.should.deepEqual({
					a: [1, 2],
					r: [1],
					type: '2p-set',
				});
			});

		});

		describe('merge', () => {

			it('combines two TwoPSets', () => {
				const one = new TwoPSet(1, 2).remove(2);
				const two = new TwoPSet(3, 4).remove(3);
				const three = TwoPSet.merge(one, two);
				three.should.be.instanceof(TwoPSet);
				Array.from(three).should.deepEqual([1, 4]);
			});

			it('throws if passed non-TwoPSets', () => {
				const set = new TwoPSet();
				(() => TwoPSet.merge(set, null)).should.throw();
				(() => TwoPSet.merge(null, set)).should.throw();
			});

		});

		describe('fromJSON', () => {

			it('returns a TwoPSet', () => {
				const elements = Array.from({ length: 10 }, (_, i) => i);
				const json = { a: elements, r: elements, type: '2p-set' };
				const set = TwoPSet.fromJSON(json);
				set.should.be.instanceof(TwoPSet);
				set.should.have.property('size', 0);
			});

		});

		it('enables use of JSON as a wire protocol', () => {
			const elements = Array.from({ length: 10 }, (_, i) => i);
			const json = { a: elements, r: elements, type: '2p-set' };
			TwoPSet.toJSON(TwoPSet.fromJSON(json)).should.deepEqual(json);
		});

	});

});

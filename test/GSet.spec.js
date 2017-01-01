/* eslint-env es6, mocha, node */
const { GSet } = require('../sets');

describe('GSet', () => {

	describe('constructor', () => {

		it('creates a Set-like Object', () => {
			new GSet().should.have.property('size', 0);
			const array = Array.from({ length: 10 }, (_, i) => i);
			Array.from(new GSet(array)).should.deepEqual(array);
		});

	});

	describe('#contains', () => {

		it('returns true/false, indicating set membership', () => {
			const set = new GSet([1]);
			set.contains(1).should.equal(true);
			set.contains(2).should.equal(false);
		});

	});

	describe('#insert', () => {

		it('adds an element and returns the set modified', () => {
			const set = new GSet();
			set.insert(0).should.equal(set);
			set.should.have.property('size', 1);
			set.insert(1).should.have.property('size', 2);
			set.insert(1).should.have.property('size', 2);
			set.insert(2).should.have.property('size', 3);
			Array.from(set).should.deepEqual([0, 1, 2]);
		});

	});

	describe('static', () => {

		describe('fromJSON', () => {

			it('returns a GSet from JSON', () => {
				const elements = Array.from({ length: 10 }, (_, i) => i);
				const set = GSet.fromJSON({ e: elements });
				set.should.be.instanceof(GSet);
				set.should.have.property('size', 10);
				Array.from(set).should.deepEqual(elements);
			});

		});

		describe('toJSON', () => {

			it('returns JSON from a GSet', () => {
				const elements = Array.from({ length: 10 }, (_, i) => i);
				const json = GSet.toJSON(new GSet(elements));
				json.should.be.instanceof(Object);
				json.should.deepEqual({ e: elements, type: 'g-set' });
			});

		});

		describe('merge', () => {

			it('returns a new GSet that combines two GSets', () => {
				const one = new GSet([1]);
				const two = new GSet([2]);
				const three = GSet.merge(one, two);
				three.should.be.instanceof(GSet);
				three.should.have.property('size', 2);
				Array.from(three).should.deepEqual([1, 2]);
			});

			it('throws an Error if passed any non-GSet', () => {
				const set = new GSet();
				(() => GSet.merge(set, null)).should.throw();
				(() => GSet.merge(null, set)).should.throw();
			});

		});

		it('enables use of JSON as a wire protocol', () => {
			const elements = Array.from({ length: 10 }, (_, i) => i);
			const json = { e: elements, type: 'g-set' }; // holds 0-9
			GSet.toJSON(GSet.fromJSON(json)).should.deepEqual(json);
		});

	});

});

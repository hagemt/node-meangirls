/* eslint-env es6, mocha, node */
const { GCounter } = require('../counters');

describe('GCounter', () => {

	describe('constructor', () => {

		it('takes no arguments and starts value at zero', () => {
			(() => new GCounter()).should.not.throw();
			new GCounter().should.have.property('value', 0);
		});

	});

	describe('#update', () => {

		it('increments the value of the counter', () => {
			const counter = new GCounter();
			counter.update();
			counter.should.have.property('value', 1);
		});

		it('returns the counter that was modified', () => {
			const counter = new GCounter();
			counter.update().should.equal(counter);
		});

		it('accepts any positive Number, defaulting to 1', () => {
			const r = Math.random();
			const counter = new GCounter()
			counter.update(r);
			counter.should.have.property('value', r);
		});

		it('accepts an "actor" Object, defaulting to null', () => {
			const counter = new GCounter();
			counter.update(1, 'one');
			counter.update(2, 'two');
			counter.should.have.property('value', 3);
		});

		it('does not accept negative Numbers, +/-Infinity, nor NaN', () => {
			const counter = new GCounter();
			(() => counter.update(-Math.random())).should.throw(Error);
			(() => counter.update(+Infinity)).should.throw(Error);
			(() => counter.update(-Infinity)).should.throw(Error);
			(() => counter.update(NaN)).should.throw(Error);
		});

	});

	describe('static', () => {

		describe('fromJSON', () => {

			it('returns a GCounter Object', () => {
				const json = { e: { test: Math.random() }, type: 'g-counter' };
				GCounter.fromJSON(json).should.have.property('value', json.e.test);
			});

			it('throws if given invalid JSON', () => {
				const unsafe = { null: Number.MIN_VALUE };
				(() => GCounter.fromJSON()).should.throw();
				(() => GCounter.fromJSON({ e: unsafe })).should.throw();
			});

		});

		describe('merge', () => {

			it('combines two GCounters, passed as arguments', () => {
				const one = new GCounter();
				const two = new GCounter();
				one.update(1, 'one');
				two.update(2, 'two');
				const three = GCounter.merge(one, two);
				three.should.be.instanceof(GCounter);
				three.should.not.equal(one);
				three.should.not.equal(two);
				three.should.have.property('value', 3);
			});

			it('will throw if either argument is not a GCounter', () => {
				const one = new GCounter();
				const two = new GCounter();
				(() => GCounter.merge(one, null)).should.throw();
				(() => GCounter.merge(null, two)).should.throw();
			});

		});

		describe('toJSON', () => {

			it('returns a JSON Object', () => {
				const counter = new GCounter();
				counter.update(1, 'one');
				counter.update(2, 'two');
				const json = GCounter.toJSON(counter);
				json.should.be.instanceof(Object);
				json.should.deepEqual({
					e: { one: 1, two: 2 },
					type: 'g-counter',
				});
			});

		});

		it('allows use of JSON as a wire protocol', () => {
			const one = new GCounter();
			while (Math.random() < 0.5) one.update(Math.random());
			const two = GCounter.fromJSON(GCounter.toJSON(one));
			one.should.have.property('value', two.value);
		});

	});

});

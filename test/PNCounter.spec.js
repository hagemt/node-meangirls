/* eslint-env es6, mocha, node */
const { PNCounter } = require('..');

describe('PNCounter', () => {

	describe('constructor', () => {

		it('takes no arguments and starts value at zero', () => {
			(() => new PNCounter()).should.not.throw();
			new PNCounter().should.have.property('value', 0);
		});

	});

	describe('#update', () => {

		it('increments the value of the counter', () => {
			const counter = new PNCounter();
			counter.update();
			counter.should.have.property('value', 1);
		});

		it('returns the counter that was modified', () => {
			const counter = new PNCounter();
			counter.update().should.equal(counter);
		});

		it('accepts any Number, defaulting to 1', () => {
			const positive = +Math.random();
			const negative = -Math.random();
			const counter = new PNCounter();
			counter.update(negative);
			counter.should.have.property('value', negative);
			counter.update(positive);
			counter.should.have.property('value', positive + negative);
		});

		it('accepts an "actor" Object, defaulting to null', () => {
			const counter = new PNCounter();
			counter.update(1, 'one');
			counter.update(2, 'two');
			counter.should.have.property('value', 3);
		});

		it('does not accept +/-Infinity, nor NaN', () => {
			const counter = new PNCounter();
			(() => counter.update(+Infinity)).should.throw();
			(() => counter.update(-Infinity)).should.throw();
			(() => counter.update(NaN)).should.throw();
		});

	});

	describe('static', () => {

		describe('fromJSON', () => {

			it('returns a PNCounter Object', () => {
				const json = {
					p: { one: Math.random(), two: Math.random() },
					n: { one: Math.random(), two: Math.random() },
					type: 'pn-counter',
				};
				const counter = PNCounter.fromJSON(json);
				counter.should.be.instanceof(PNCounter);
				const sum1 = json.p.one + json.p.two;
				const sum2 = json.n.one + json.n.two;
				counter.should.have.property('value', sum1 - sum2);
			});

			it('throws if given invalid JSON', () => {
				const unsafe = { null: Number.MIN_VALUE };
				(() => PNCounter.fromJSON()).should.throw();
				(() => PNCounter.fromJSON({ p: unsafe, n: {} })).should.throw();
				(() => PNCounter.fromJSON({ p: {}, n: unsafe })).should.throw();
			});

		});

		describe('merge', () => {

			it('combines two PNCounters', () => {
				const one = new PNCounter();
				const two = new PNCounter();
				one.update(1, 'positive');
				one.update(-2, 'negative');
				two.update(-1, 'negative');
				two.update(2, 'positive');
				const three = PNCounter.merge(one, two);
				three.should.be.instanceof(PNCounter);
				three.should.not.equal(one);
				three.should.not.equal(two);
				three.should.have.property('value', 0);
			});

			it('will throw if either is not a PNCounter', () => {
				const one = new PNCounter();
				const two = new PNCounter();
				(() => PNCounter.merge(one, null)).should.throw();
				(() => PNCounter.merge(null, two)).should.throw();
			});

		});

		describe('toJSON', () => {

			it('returns a JSON Object', () => {
				const counter = new PNCounter();
				counter.update(1, 'one');
				counter.update(-2, 'two');
				const json = PNCounter.toJSON(counter);
				json.should.be.instanceof(Object);
				json.should.deepEqual({
					n: { two: 2 },
					p: { one: 1 },
					type: 'pn-counter',
				});
			});

		});

		it('allows use of JSON as a wire protocol', () => {
			const one = new PNCounter();
			while (Math.random() < 0.5) one.update(Math.random());
			const two = PNCounter.fromJSON(PNCounter.toJSON(one));
			one.should.have.property('value', two.value);
		});

	});

});

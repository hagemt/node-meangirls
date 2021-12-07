/* eslint-env es6, node */
const { GCounter, PNCounter } = require('./counters')
const { GSet, TwoPSet, LWWESet, ORSet, MCSet } = require('./sets')

const COUNTER_CLASSES = Object.freeze([GCounter, PNCounter])
const SET_CLASSES = Object.freeze([GSet, TwoPSet, LWWESet, ORSet, MCSet])

const mergeCRDTs = (...items) => {
	const types = items.map((item) => {
		for (const T of COUNTER_CLASSES) {
			if (item instanceof T) return T
		}
		for (const T of SET_CLASSES) {
			if (item instanceof T) return T
		}
	})
	const typesSet = new Set(types.filter((type) => !!type))
	if (typesSet.size !== 1) {
		// FIXME (tohagema): options for LWWESet/ORSet?
		const names = types.map((T = {}) => T.name || 'non-CRDT').join(', ')
		throw new TypeError(`arguments ALL MUST have SAME CRDT (not: ${names})`)
	}
	const T = Array.from(typesSet)[0]
	return T.merge(...items)
}

module.exports = mergeCRDTs

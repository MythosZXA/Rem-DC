let deck = Array.from({ length: 52 }, (_, i) => `c${i + 1}`);
const table = [];
const hands = new Map();

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleDeck() {
	deck = deck.map(card => ({ card, sort: Math.random() }))
		.sort((a, z) => a.sort - z.sort)
		.map(({ card }) => card);
}

module.exports = {
	name: '/cards/start',
	type: 'post',
	execute(req, res, rem) {

	}
}
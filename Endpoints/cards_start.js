let deck = [];
const table = [];
const hands = new Map();

function resetDeck() {
	deck = Array.from({ length: 52 }, (_, i) => `c${i + 1}`);
}

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
		if (!req.cookies.dcUsername) {
			res.sendStatus(403);
		}

		resetDeck();
		shuffleDeck();

		const players = req.body.players;
		for (let i = 0; i < players.length; i++) {
			hands.set(players[i], deck.splice(-13));
		}

		const hand = deck.splice(-13);
		hands.set(req.cookies.dcUsername, hand);

		res.send(hand)
	}
}
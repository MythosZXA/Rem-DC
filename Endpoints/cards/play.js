const { table, hands } = require('./start');
const { sendTable } = require('./table');

module.exports = {
	name: '/cards/play',
	type: 'post',
	execute(req, res, rem) {
		const hand = hands.get(req.cookies.dcUsername);
		const filteredHand = hand.filter((card => !req.body.cards.includes(card)));
		hands.set(req.cookies.dcUsername, filteredHand);

		table.push(req.body.cards);
		sendTable();
		res.send({});
	}
}
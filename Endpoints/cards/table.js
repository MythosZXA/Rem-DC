const { table, hands } = require('./start');

const people = new Map();

function sendTable() {
	people.forEach(res => {
		const resObj = { table };
		res.write(`data: ${JSON.stringify(resObj)}\n\n`);
	});
}

function setInactiveGame() {
	people.forEach(res => {
		res.write(`data: false\n\n`);
	});
}

module.exports = {
	name: '/cards/table',
	type: 'get',
	sendTable,
	setInactiveGame,
	execute(req, res) {
		const hand = hands.get(req.cookies.dcUsername) ?? [];
		const resObj = {
			table,
			hand
		};
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Connection': 'keep-alive',
			'Cache-Control': 'no-cache'
		})
		.write(`data: ${JSON.stringify(resObj)}\n\n`);

		people.set(req.cookies.dcUsername, res);
	}
}
const { resetLobby } = require('./cards_lobby');
const { setInactiveGame } = require('./cards_table');
const { clearGame } = require('./cards_start');

module.exports = {
	name: '/cards/stop',
	type: 'post',
	execute(_, res) {
		clearGame();
		resetLobby();
		setInactiveGame();
		res.sendStatus(200);
	}
}
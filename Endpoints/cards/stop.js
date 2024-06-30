const { resetLobby } = require('./lobby');
const { setInactiveGame } = require('./table');
const { clearGame } = require('./start');

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
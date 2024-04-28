let lobby = [];

function sendLobby() {
	lobby.forEach(obj1 => {
		const filteredLobby = lobby.filter(obj2 => obj2.id !== obj1.id); // exclude "self"
		obj1.res.write(`data: ${JSON.stringify(filteredLobby.map(obj2 => obj2.player))}\n\n`);
	});
}

module.exports = {
	name: '/cards/lobby',
	type: 'get',
	async execute(req, res, rem) {
		if (!req.cookies.sessionID || !req.cookies.dcUsername) {
			res.sendStatus(403);
			return;
		}

		// send current lobby to player who just joined the lobby
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Connection': 'keep-alive',
			'Cache-Control': 'no-cache'
		})
		.write(`data: ${JSON.stringify(lobby.map(obj => obj.player))}\n\n`);

		// join lobby
		const server = await rem.guilds.fetch(process.env.guildId);
		const member = server.members.cache.find(member => member.user.username === req.cookies.dcUsername);
		lobby.push({
			id: req.cookies.sessionID,
			player: {
				avatarURL: member.displayAvatarURL(),
				username: req.cookies.dcUsername
			},
			res
		});
		console.log(`${req.cookies.dcUsername} has joined the cards lobby`);

		// send updated lobby to players in lobby
		sendLobby();

		// leave lobby
		req.on('close', () => {
			lobby = lobby.filter(player => player.id !== req.cookies.sessionID);
			sendLobby();
			console.log(`${req.cookies.dcUsername} has left the cards lobby`);
		});
	}
};
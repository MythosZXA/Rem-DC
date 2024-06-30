const lobby = new Set(); // holds objects representing guests in the cards lobby

/**
 * Send guest information to all guests in the lobby
 */
function sendLobby() {
	lobby.forEach(curGuest => {
		const filteredLobby = [...lobby.values()].filter(otherGuest => otherGuest.id !== curGuest.id); // exclude "self"
		curGuest.res.write(`data: ${JSON.stringify(filteredLobby.map(otherGuest => otherGuest.participant))}\n\n`);
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

		// send current lobby to guest who just joined the lobby
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Connection': 'keep-alive',
			'Cache-Control': 'no-cache'
		})
		.write(`data: ${JSON.stringify([...lobby.values()].map(obj => obj.participant))}\n\n`);

		// join lobby
		const server = await rem.guilds.fetch(process.env.guildId);
		const member = server.members.cache.find(member => member.user.username === req.cookies.dcUsername);
		const guestObj = {
			id: req.cookies.sessionID,
			participant: {
				avatarURL: member.displayAvatarURL(),
				username: req.cookies.dcUsername
			},
			res
		};
		lobby.add(guestObj);
		console.log(`${req.cookies.dcUsername} has joined the cards lobby`);

		// send updated lobby to guest in lobby
		sendLobby();

		// leave lobby
		req.on('close', () => {
			lobby.delete(guestObj);
			sendLobby();
			console.log(`${req.cookies.dcUsername} has left the cards lobby`);
		});
	}
};
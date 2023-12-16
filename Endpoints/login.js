
const crypto = require('crypto');

function restoreSession(req, res, expressGlobal, server) {
	const sessionID = req.cookies.sessionID;
	const nickname = expressGlobal.sessions.get(sessionID);
	if (nickname) {
		const member = server.members.cache.find(member => member.nickname?.toLowerCase() === nickname);
		const avatarURL = member.displayAvatarURL();
		res.send({ avatarURL: avatarURL });
	} else {
		res.sendStatus(401);
	}
}

function findMember(req, res, rem, expressGlobal, server) {
	if (!req.body.input) res.sendStatus(404);
	const nickname = req.body.input.toLowerCase();

	// Rem login
	if (nickname === 'remadmin') {
		const sessionID = crypto.randomUUID();
		expressGlobal.admins.add(sessionID);
		console.log(expressGlobal);
		res.cookie('sessionID', sessionID, {
			secure: false,
			httpOnly: true,
			sameSite: false
		})
		.send({ avatarURL: rem.user.avatarURL() });
		return;
	}

	// Member login
	const member = server.members.cache.find(member => member.nickname?.toLowerCase() === nickname);
	if (member) {
		const randomPin = Math.floor(Math.random() * (1000000 - 100000) + 100000).toString();
		expressGlobal.sessions.set(nickname, randomPin);
		member.send(randomPin);
		res.cookie('nickname', nickname, {
			secure: false, // Http(s)
			httpOnly: true, // Client JS code can't access
			sameSite: false // Same port
		})
		.sendStatus(202);
	} else {
		res.sendStatus(404);
	}
}

function validateCode(req, res, expressGlobal, server) {
	if (!req.cookies.nickname) res.sendStatus(401);

	const nickname = req.cookies.nickname.toLowerCase();
	const recievedPin = req.body.input;
	const correctPin = expressGlobal.sessions.get(nickname);

	if (recievedPin === correctPin) {
		const member = server.members.cache.find(member => member.nickname?.toLowerCase() === nickname);
		const avatarURL = member.displayAvatarURL();
		const sessionID = crypto.randomUUID();
		expressGlobal.sessions.delete(nickname);
		expressGlobal.sessions.set(sessionID, nickname);
		res.cookie('sessionID', sessionID, {
			secure: false,
			httpOnly: true
		})
		.cookie('discordID', member.id, {
			secure: false,
			httpOnly: true
		})
		.send({ avatarURL: avatarURL });
	} else {
		res.sendStatus(401);
	}
}

module.exports = {
	name: '/login',
	type: 'post',
	async execute(req, res, rem, expressGlobal) {
		const server = await rem.guilds.fetch('773660297696772096');
		switch (req.body.reqType) {
			case 'S': // session restore request
				restoreSession(req, res, expressGlobal, server);
				break;
			case 'N': // nickname request
				findMember(req, res, rem, expressGlobal, server);
				break;
			case 'C': // code request
				validateCode(req, res, expressGlobal, server);
				break;
			default:
				break;
		}
	}
};
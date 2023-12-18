
require('dotenv').config();
const crypto = require('crypto');

function restoreSession(req, res, express, server) {
	const sessionID = req.cookies.sessionID;
	const nickname = express.sessions.get(sessionID);
	if (nickname) {
		const member = server.members.cache.find(member => member.nickname?.toLowerCase() === nickname);
		const avatarURL = member.displayAvatarURL();
		res.send({ avatarURL: avatarURL });
	} else {
		res.sendStatus(401);
	}
}

function findMember(req, res, rem, express, server) {
	if (!req.body.input) res.sendStatus(404);

	const username = req.body.input.toLowerCase();
	// Rem login
	if (username === process.env.admin) {
		const sessionID = crypto.randomUUID();
		express.admins.add(sessionID);
		res.cookie('sessionID', sessionID, {
			secure: false, // Http(s)
			httpOnly: true, // Client JS code can't access
			sameSite: false // Same port
		})
		.send({ avatarURL: rem.user.avatarURL() });
		return;
	}

	// Member login
	const member = server.members.cache.find(member => member.user.username === username);
	if (member) {
		const randomPin = Math.floor(Math.random() * (1000000 - 100000) + 100000).toString();
		express.sessions.set(username, randomPin);
		member.send(randomPin);
		res.cookie('dcUsername', username, {
			secure: false,
			httpOnly: true,
			sameSite: false
		})
		.status(202)
		.send({});
	} else {
		res.sendStatus(404);
	}
}

function validateCode(req, res, express, server) {
	if (!req.cookies.dcUsername && !req.cookies.input) {
		res.sendStatus(401);
	}

	const username = req.cookies.dcUsername.toLowerCase();
	const recievedPin = req.body.input;
	const correctPin = express.sessions.get(username);

	if (recievedPin === correctPin) {
		const member = server.members.cache.find(member => member.user.username === username);
		const avatarURL = member.displayAvatarURL();
		const sessionID = crypto.randomUUID();
		express.sessions.delete(username);
		express.sessions.set(sessionID, username);
		res.cookie('sessionID', sessionID, {
			secure: false,
			httpOnly: true,
			sameSite: false
		})
		.cookie('discordID', member.id, {
			secure: false,
			httpOnly: true,
			sameSite: false
		})
		.send({
			id: member.id,
			username: member.user.username,
			avatarURL: avatarURL
		});
	} else {
		res.sendStatus(401);
	}
}

module.exports = {
	name: '/login',
	type: 'post',
	async execute(req, res, rem) {
		const express = rem.express;
		const server = await rem.guilds.fetch('773660297696772096');
		switch (req.body.reqType) {
			case 'S': // session restore request
				restoreSession(req, res, express, server);
				break;
			case 'U': // username request
				findMember(req, res, rem, express, server);
				break;
			case 'C': // code request
				validateCode(req, res, express, server);
				break;
			default:
				break;
		}
	}
};
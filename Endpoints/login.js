require('dotenv').config();
const crypto = require('crypto');

const cookieConfig = {
  secure: true,
  httpOnly: true,
  sameSite: 'none'
};

function restoreSession(req, res, express, server) {
  // if session ID isn't provided, return
  const sessionID = req.cookies.rdcSID;
  if (!sessionID) {
    res.status(400).send('No session cookie provided');
    return;
  }
  // if session ID doesn't exist, return
  const dcUserInfo = express.sessions.get(sessionID)
  if (!dcUserInfo) {
    res.status(400).send('Session not found');
    return;
  }

  res.send({
    token: dcUserInfo.accessToken,
    tokenType: dcUserInfo.tokenType
  });
}

function findMember(req, res, rem, express, server) {
  if (!req.body.input) {
    res.sendStatus(404);
    return;
  }

  const username = req.body.input.toLowerCase();
  // Rem login
  if (username === process.env.admin) {
    const sessionID = crypto.randomUUID();
    express.admins.add(sessionID);
    res.cookie('sessionID', sessionID, cookieConfig)
    .send({
      admin: true,
      avatarURL: rem.user.avatarURL()
    });
    return;
  }

  // Member login
  const member = server.members.cache.find(member => member.user.username === username);
  if (member) {
    const randomPin = Math.floor(Math.random() * (1000000 - 100000) + 100000).toString();
    express.sessions.set(username, randomPin);
    member.send(randomPin);
    res.cookie('dcUsername', username, cookieConfig)
    .status(202)
    .send({});
  } else {
    res.sendStatus(404);
  }
}

function validateCode(req, res, express, server) {
  if (!req.cookies.dcUsername) {
    res.sendStatus(401);
    return;
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
    if (member.id === process.env.toan) {
      express.admins.add(sessionID);
    }

    res.cookie('sessionID', sessionID, cookieConfig)
    .cookie('discordID', member.id, cookieConfig)
    .send({
      id: member.id,
      admin: express.admins.has(sessionID) ? true : false,
      username: member.user.username,
      avatarURL: avatarURL
    });
  } else {
    res.sendStatus(401);
  }
}

function createSession(req, res, express) {
  if (!req.body.user?.accessToken) {
    res.sendStatus(400);
    return;
  }

  const sessionID = crypto.randomUUID();
  express.sessions.set(sessionID, req.body.user);
  res.cookie('rdcSID', sessionID, cookieConfig).send({});
}

module.exports = {
  name: '/login',
  type: 'post',
  async execute(req, res, rem) {
    const express = rem.express;
    const server = await rem.guilds.fetch(process.env.guildId);
    switch (req.body.reqType) {
      case 'R': // session restore request
        restoreSession(req, res, express, server);
        break;
      case 'U': // username request
        findMember(req, res, rem, express, server);
        break;
      case 'C': // code request
        validateCode(req, res, express, server);
        break;
      case 'L': // session create request
        createSession(req, res, express);
      default:
        break;
    }
  }
};
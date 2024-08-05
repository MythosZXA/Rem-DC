require('dotenv').config();
const crypto = require('crypto');

const cookieConfig = {
  secure: true,
  httpOnly: true,
  sameSite: 'none'
};

function restoreSession(req, res, express) {
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

function createSession(req, res, express) {
  const user = req.body.user;
  if (!user?.accessToken) {
    res.status(400).send('No access token cookie provided');
    return;
  }

  const sessionID = crypto.randomUUID();
  res.cookie('rdcSID', sessionID, cookieConfig);
  express.sessions.set(sessionID, user);

  // determine if user is an admin
  const adminUIDs = process.env.admins.split(',');
  if (adminUIDs.includes(user.id)) {
    express.admins.add(sessionID);
    res.send({ admin: true });
  } else {
    res.send({});
  }
}

module.exports = {
  name: '/login',
  type: 'post',
  async execute(req, res, rem) {
    const express = rem.express;
    switch (req.body.reqType) {
      case 'R': // session restore request
        restoreSession(req, res, express);
        break;
      case 'L': // session create request
        createSession(req, res, express);
      default:
        break;
    }
  }
};
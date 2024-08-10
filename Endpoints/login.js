require('dotenv').config();
const crypto = require('crypto');

const cookieConfig = {
  maxAge: 1000 * 60 * 60 * 24,
  secure: true,
  httpOnly: true,
  sameSite: 'none'
};

async function createSession(req, res, express) {
  // if token isn't provided, return
  const tokenInfo = req.body.tokenInfo;
  if (!tokenInfo?.[0]) {
    res.status(400).send('No access token provided');
    return;
  }

  // request user information from discord
  const resDC = await fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `${tokenInfo[1]} ${tokenInfo[0]}`
    }
  });

  // if no information was provided, return
  if (!resDC.ok) {
    res.status(401).send('Token is expired or invalid');
    return;
  }

  // create session
  const userSess = await resDC.json();
  const sessionID = crypto.randomUUID();
  res.cookie('rdcSID', sessionID, cookieConfig);
  express.sessions.set(sessionID, userSess);

  // determine if user is an admin
  const adminUIDs = process.env.admins.split(',');
  if (adminUIDs.includes(userSess.id)) {
    express.admins.add(sessionID);
    userSess.admin = true;
  }

  // send user information to client
  res.send({ userSess });
}

function restoreSession(req, res, express) {
  const SID = extractSID(req, res);
  if (!SID) return;
  
  const userSess = getUserSess(SID, res, express);
  if (!userSess) return;

  // send active session (user information)
  res.send({ userSess });
}

//** HELPER FUNCTIONS */

function extractSID(req, res) {
  const SID = req.cookies.rdcSID;
  if (!SID) {
    res.status(400).send('No session cookie provided');
    return null;
  } 

  return SID;
}

function getUserSess(SID, res, express) {
  const userSess = express.sessions.get(SID);
  if (!userSess) {
    res.status(404).send('Session not found');
    return null;
  }

  return userSess;
}

//** END HELPER FUNCTIONS */

module.exports = {
  name: '/login',
  type: 'post',
  async execute(req, res, rem) {
    const express = rem.express;
    switch (req.body.reqType) {
      case 'L': // session create request
        createSession(req, res, express);
        break;
      case 'R': // session restore request
        restoreSession(req, res, express);
        break;
      default:
        break;
    }
  }
};
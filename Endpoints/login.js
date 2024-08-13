import { extractSID, getSessUser } from './common.js';
import crypto from 'crypto';

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
  
  const sessUser = getSessUser(SID, res, express);
  if (!sessUser) return;

  // send active session (user information)
  res.send({ sessUser });
}

export default {
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
import { extractSID } from './common.js';

export default {
  name: '/logout',
  type: 'post',
  execute(req, res, rem) {
    const SID = extractSID(req, res);
    if (!SID) return;

    const express = rem.express;
    express.sessions.delete(req.cookies.rdcSID);
    express.admins.delete(req.cookies.rdcSID);
    res.send({});
  }
};
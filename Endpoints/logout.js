const epFuncs = require('./common');

module.exports = {
  name: '/logout',
  type: 'post',
  execute(req, res, rem) {
    const SID = epFuncs.extractSID(req, res);
    if (!SID) return;

    const express = rem.express;
    express.sessions.delete(req.cookies.rdcSID);
    express.admins.delete(req.cookies.rdcSID);
    res.send({});
  }
};
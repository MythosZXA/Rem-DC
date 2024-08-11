/* Helper functions. NOT an endpoint file */

function extractSID(req, res) {
  const SID = req.cookies.rdcSID;
  if (!SID) {
    res.status(400).send('No session cookie provided');
    return null;
  } 

  return SID;
}

function getSessUser(SID, res, express) {
  const sessUser = express.sessions.get(SID);
  if (!sessUser) {
    res.status(404).send('Session not found');
    return null;
  }

  return sessUser;
}

module.exports = {
  extractSID,
  getSessUser
};
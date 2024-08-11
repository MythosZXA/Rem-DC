const epFuncs = require ('../common');

const lobby = new Map(); // holds objects representing guests in the cards lobby

setInterval(() => {
  sendLobby();
}, 1000 * 60);

/**
 * Send guest information to all guests in the lobby
 */
function sendLobby() {
  lobby.forEach(curGuest => {
    const arrParticipants = Array.from(lobby.values())
      .map(guest => guest.participant) // exclude res

    curGuest.res.write(`data: ${JSON.stringify(arrParticipants)}\n\n`);
  });
}

module.exports = {
  name: '/cards/lobby',
  type: 'get',
  async execute(req, res, rem) {
    const SID = epFuncs.extractSID(req, res);
    if (!SID) return;

    const sessUser = epFuncs.getSessUser(SID, res, rem.express);
    if (!sessUser) return;

    // join lobby
    const server = await rem.guilds.fetch(process.env.guildId);
    const member = server.members.cache.find(member => member.user.username === sessUser.username);
    const guestObj = {
      participant: {
        avatarURL: member.displayAvatarURL(),
        username: sessUser.username
      },
      res
    };
    lobby.set(SID, guestObj);
    console.log(`${sessUser.username} has joined the cards lobby`);

    // set response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    });

    // send updated lobby to guest in lobby
    sendLobby();

    // leave lobby
    req.on('close', () => {
      lobby.delete(SID);
      sendLobby();
      console.log(`${sessUser.username} has left the cards lobby`);
    });
  }
};
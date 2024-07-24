const lobby = new Map(); // holds objects representing guests in the cards lobby

/**
 * Send guest information to all guests in the lobby
 */
function sendLobby() {
  lobby.forEach(curGuest => {
    const filteredLobby = Array.from(lobby.values())
      .map(guest => guest.participant) // exclude res
      .filter(otherGuest => otherGuest.username !== curGuest.participant.username); // exclude "self"

    curGuest.res.write(`data: ${JSON.stringify(filteredLobby)}\n\n`);
  });
}

module.exports = {
  name: '/cards/lobby',
  type: 'get',
  async execute(req, res, rem) {
    if (!req.cookies.sessionID || !req.cookies.dcUsername) {
      res.sendStatus(403);
      return;
    }

    const sessID = req.cookies.sessionID;
    const username = req.cookies.dcUsername;

    // send current lobby to guest who just joined the lobby
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    });

    // join lobby
    const server = await rem.guilds.fetch(process.env.guildId);
    const member = server.members.cache.find(member => member.user.username === username);
    const guestObj = {
      participant: {
        avatarURL: member.displayAvatarURL(),
        username
      },
      res
    };
    lobby.set(sessID, guestObj);
    console.log(`${username} has joined the cards lobby`);

    // send updated lobby to guest in lobby
    sendLobby();

    // leave lobby
    req.on('close', () => {
      lobby.delete(sessID);
      sendLobby();
      console.log(`${username} has left the cards lobby`);
    });
  }
};
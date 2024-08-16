import { extractSID, getSessUser } from '../common.js';
import { lobby, hands, sendLobby, sendTable } from './common.js';

export default {
  name: '/cards/lobby',
  type: 'get',
  async execute(req, res, rem) {
    const SID = extractSID(req, res);
    if (!SID) return;

    const sessUser = getSessUser(SID, res, rem.express);
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

    // send table if active game, otherwise lobby
    hands.size ? sendTable() : sendLobby();

    // leave lobby
    req.on('close', () => {
      lobby.delete(SID);
      sendLobby();
      console.log(`${sessUser.username} has left the cards lobby`);
    });
  }
};
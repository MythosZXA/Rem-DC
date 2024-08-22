import { extractSID, getSessUser } from '../common.js';
import { tableSpectators, sendTable } from './common.js';

export default {
  name: '/cards/table',
  type: 'get',
  async execute(req, res, rem) {
    const SID = extractSID(req, res);
    if (!SID) return;

    const sessUser = getSessUser(SID, res, rem.express);
    if (!sessUser) return;

    // spectate table
    tableSpectators.set(SID, res);
    console.log(`${sessUser.username} has started spectating the card game`);

    // set response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    });

    sendTable();

    // leave lobby
    req.on('close', () => {
      tableSpectators.delete(SID);
      sendTable();
      console.log(`${sessUser.username} has stopped spectating the card game`);
    });
  }
};
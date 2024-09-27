import { extractSID } from '../common.js';
import { lobby, deck, hands, sendLobby, resetDeck, shuffleDeck } from './common.js';

export default {
  name: '/cards/begin',
  type: 'post',
  execute(req, res, rem) {
    if (hands.size) return;

    const SID = extractSID(req, res);
    if (!SID) return;

    const players = req.body.players;
    if (!players || players.length > 4) return;

    resetDeck();
    shuffleDeck();

    const deLobby = [...lobby.entries()];
    let hand;
    // deal cards to all players
    players.forEach(player => {
      // get SID associated to username
      const pSID = deLobby.find(arr => arr[1].participant.username === player)[0];
      // deal
      hand = deck.splice(-13);
      hands.set(pSID, hand);
    });

    sendLobby();
    res.send({});
  }
}
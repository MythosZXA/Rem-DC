import { table, hands, sendTable } from '../Endpoints/cards/common.js';
import cookie from 'cookie';

export default {
  event: 'cardPlay',
  async execute(eventObj, socket, _) {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const SID = cookies.rdcSID;

    const hand = hands.get(SID);
    if (!hand) return;

    // remove cards from hand
    eventObj.arrCards.forEach(card => {
      const index = hand.indexOf(card);
      hand.splice(index, 1);
    });

    // play cards to table
    table.push(eventObj.arrCards);
    sendTable();
  }
};
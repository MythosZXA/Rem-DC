export const lobby = new Map(); // holds objects representing guests in the cards lobby
export const tableSpectators = new Map();
export const table = [];
export let deck = [];
export const hands = new Map();

setInterval(() => {
  sendLobby();
  sendTable();
}, 1000 * 60);

export function sendLobby() {
  lobby.forEach(curGuest => {
    const arrParticipants = Array.from(lobby.values())
      .map(guest => guest.participant) // exclude res

    curGuest.res.write(`data: ${hands.size ? '{}' : JSON.stringify(arrParticipants)}\n\n`);
  });
}

export function sendTable() {
  tableSpectators.forEach(resSpectator => {
    resSpectator.write(`data: ${JSON.stringify(table)}\n\n`);
  });
}

export function resetDeck() {
  deck = Array.from({ length: 52 }, (_, i) => `c${i + 1}`);
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffleDeck() {
  deck = deck.map(card => ({ card, sort: Math.random() }))
    .sort((a, z) => a.sort - z.sort)
    .map(({ card }) => card);
}
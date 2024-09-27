import cookie from 'cookie';

export default {
  event: 'disconnect',
  async execute(objReason, socket, rem) {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const username = rem.express.sessions.get(cookies.rdcSID)?.username ?? 'Guest';
    const destinationID = socket.handshake.query.id;
    console.log(`${username} disconnected from room ${destinationID}`);
  }
};
export default {
  event: 'remDM',
  async execute(objDM, socket, rem) {
    const destinationID = socket.handshake.query.id;
    const server = await rem.guilds.fetch(process.env.guildId);
    const serverMember = server.members.cache.find(member => member.id === destinationID);
    if (serverMember) {
      serverMember.send(objDM.content);
    } else {
      const textChannel = [...rem.serverChannels.values()].find(channel => channel.id === destinationID);
      textChannel.send(objDM.content);
    }
  }
};
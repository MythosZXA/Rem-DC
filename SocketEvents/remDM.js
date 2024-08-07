module.exports = {
  event: 'remDM',
  async execute(dm, rem, destinationID) {
    const server = await rem.guilds.fetch(process.env.guildId);
    const serverMember = server.members.cache.find(member => member.id === destinationID);
    if (serverMember) {
      serverMember.send(dm.content);
    } else {
      const textChannel = [...rem.serverChannels.values()].find(channel => channel.id === destinationID);
      textChannel.send(dm.content);
    }
  }
};
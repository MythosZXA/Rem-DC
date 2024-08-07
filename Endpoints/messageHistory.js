module.exports = {
  name: '/messageHistory',
  type: 'post',
  async execute(req, res, rem, expressGlobal) {
    if (!expressGlobal.admins.has(req.cookies.rdcSID) && req.body.bypassCode !== process.env.admin) {
      res.sendStatus(401);
      return;
    }

    const server = await rem.guilds.fetch(process.env.guildId);
    const destinationID = req.body.id;
    let channel;

    const guildMember = server.members.cache.find(member => member.id === destinationID);
    // get dm channel if user is found
    if (guildMember) { channel = await guildMember.createDM(); }
    // get text channel if user isn't found
    else { channel = [...rem.serverChannels.values()].find(channel => channel.id === destinationID); }

    // format the response depending on dm/channel
    let messageHistory = await channel.messages.fetch({ limit: 30 });
    messageHistory = [...messageHistory.values()];
    res.send(messageHistory.map(message => ({
      rem: message.author.bot,
      avatarURL: message.author.displayAvatarURL(),
      content: message.content
    })));
  }
};
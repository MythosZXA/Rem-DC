const epFuncs = require('./common');

module.exports = {
  name: '/messageHistory',
  type: 'post',
  async execute(req, res, rem) {
    const SID = epFuncs.extractSID(req, res);
    if (!SID) return;

    const destinationID = req.body.id;
    if (!destinationID) {
      res.status(400).send('No destination ID provided');
      return;
    }

    const server = await rem.guilds.fetch(process.env.guildId);
    let channel;

    const guildMember = server.members.cache.find(member => member.id === destinationID);
    // get dm channel if user is found
    if (guildMember) { channel = await guildMember.createDM(); }
    // get text channel if user isn't found
    else { channel = [...rem.serverChannels.values()].find(ch => ch.id === destinationID); }

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
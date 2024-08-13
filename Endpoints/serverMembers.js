import { extractSID } from './common.js';

export default {
  name: '/serverMembers',
  type: 'get',
  async execute(req, res, rem) {
    const SID = extractSID(req, res);
    if (!SID) return;
    
    const server = await rem.guilds.fetch(process.env.guildId);
    const members = server.members.cache;
    const realMembers = members.filter(member => !member.user.bot);
    res.send({
      remAvatarURL: rem.user.displayAvatarURL(),
      members: realMembers
    });
  }
};
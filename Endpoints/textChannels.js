import { extractSID } from './common.js';
import { ChannelType } from "discord.js";

export default {
  name: '/textChannels',
  type: 'get',
  async execute(req, res, rem) {
    const SID = extractSID(req, res);
    if (!SID) return;
    
    const server = await rem.guilds.fetch(process.env.guildId);
    const channels = await server.channels.fetch();
    const textChannels = channels.filter(channel => channel.type === ChannelType.GuildText);
    res.send(textChannels);
  }
};
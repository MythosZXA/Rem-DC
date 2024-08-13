import { Events } from 'discord.js';
import { dropUser } from '../sequelize.js';

export default {
  name: Events.GuildMemberRemove,
  many: true,
  execute(member, rem) {
    // bot left, exit
    if (member.user.bot) return;

    // remove user (locally) from db
    rem.remDB.get('users').delete(member.id)

    // remove user (directly) from db
    dropUser(member.id);
  }
};
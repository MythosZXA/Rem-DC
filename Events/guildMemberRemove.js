module.exports = {
	name: 'guildMemberRemove',
	many: true,
	execute(member, rem) {
		// bot left, exit
		if (member.user.bot) return;

		// remove user (locally) from db
		rem.remDB.get('users').delete(member.id)

		// remove user (directly) from db
		require('../sequelize').dropUser(member.id);
	}
};
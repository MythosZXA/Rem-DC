const User = require('../Classes/User');

module.exports = {
	name: 'guildMemberAdd',
	many: true,
	execute(member, rem) {
		// bot joined, exit
		if (member.user.bot) return;

		// add user to db
		rem.remDB.get('users').set(member.id, new User(member.id, member.user.username));
	}
};
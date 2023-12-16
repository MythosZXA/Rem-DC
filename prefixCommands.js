function code(message, arg) {
	if (message.member.id !== process.env.toan) return;
	
	try {
		arg.shift(); // removes prefix
		arg.shift(); // removes command
		eval(arg.join(" ")); // rebuilds message
	} catch (error) {
		console.log(error);
	}
}

async function message(message, arg) {
	if (message.member.id !== process.env.toan) return;

	// if arg[2] is nickname
	const user = (await message.guild.members.fetch()).find(guildMember => 
		guildMember.nickname?.toLowerCase() == arg[2].toLowerCase());
	// if arg[2] is text channel name
	const textChannel = (await message.guild.channels.fetch()).find(guildChannel =>
		guildChannel.name == arg[2].toLowerCase());
	// send msg to destination
	const msgToSend = arg.join(' ').substring(14 + arg[2].length);
	if (user)
		user.send(msgToSend);
	else if (textChannel)
		textChannel.send(msgToSend);
}

async function sleep(message) {
	await require('./sequelize').exportMemoryToDB(message.client);
	process.kill(process.pid, 'SIGTERM');
}

async function test(message) {
	if (message.author.id != process.env.toan) return;
}

async function wakeraf(message) {
	const smexiesChannel = message.client.serverChannels.get('smexies');
	let tagAmt = 0;

	const rafMember = await message.guild.members.fetch('188548021598945280');
	const interval = setInterval(() => {
		if (tagAmt === 10) clearInterval(interval);
		tagAmt++;
		smexiesChannel.send(`${rafMember}`);
	}, 1000);
}

module.exports = {
	code,
	message,
	sleep,
	test,
	wakeraf,
};
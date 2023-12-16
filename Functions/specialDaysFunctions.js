const { MessageAttachment } = require('discord.js');
const smexiesIDs = ['188548021598945280', '176147405417218048', '557793240791908352'];

/**
 * The function checks for users with birthdays set and sends them a birthday message if it's their
 * birthday, and then schedules the function to run again the next day.
 * @param server - It is a parameter that represents the Discord server where the bot is running.
 * @param rem - Discord client. It is used to access the bot's database and server channels.
 */
function checkBirthday(server, rem) {
	setTimeout(() => {
		// filter users with birthday set
		const users  = rem.remDB.get('users');
		const birthdayUsers = [...users].filter(userArr => userArr[1].birthday);

		// get today's month and date
		const currentDay = new Date();
		const currentMonth = currentDay.getMonth() + 1;
		const currentDate = currentDay.getDate();

		// compare each birthday to today's date
		birthdayUsers.forEach(async userArr => {
			// get current user birth month and date
			const birthdayFormat = userArr[1].birthday.split('/');
			const userMonth = parseInt(birthdayFormat[0]);
			const userDate = parseInt(birthdayFormat[1]);

			// if it's the user's birthday, send birthday message
			if (userMonth == currentMonth && userDate == currentDate) {
				const bdMember = await server.members.fetch(userArr[1].id);
				const channelSmexies = rem.serverChannels.get('smexies');
				const picture = new MessageAttachment('https://i.imgur.com/7IqikPC.jpg');

				// send to channel or DM
				const channelBool = smexiesIDs.includes(userArr[1].id);
				(channelBool ? channelSmexies : bdMember).send({
					content: `🎉🎉 Happy Birthday${channelBool ? ` ${bdMember}` : ''}!!! 🎉🎉`,
					files: [picture]
				});
			}
		});

		// check again tomorrow
		console.log(`Hours until midnight: ${secsToMidnight() / 60 / 60}`);
		checkBirthday(server, rem);
	}, (1000 * secsToMidnight()) + (1000 * 5));
}

/**
 * Every day at midnight, check if it's a holiday. If it is, send a message to the general channel
 * @param channels - a Map of all the channels in the server
 */
function checkHoliday(channels) {
	setTimeout(async () => {
		// get today's month and date
		const currentTime = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
		const currentMonth = new Date(currentTime).getMonth() + 1;
		const currentDate = new Date(currentTime).getDate();
		// christmas
		if (currentMonth == 12 && currentDate == 25) {
			const picture = new MessageAttachment('https://i.imgur.com/hURyyWx.jpg');
			const generalChannel = channels.get('general');
			generalChannel.send({
				content: 'Merry Christmas @everyone',
				files: [picture]
			});
		}
		// check again tomorrow
		checkHoliday(channels);
	}, (1000 * secsToMidnight()) + (1000 * 5));
}

function secsToMidnight() {
	let currentTimeString = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
	let currentTime = new Date(currentTimeString);
	let midnight = new Date(currentTime).setHours(24, 0, 0, 0);
	return (midnight - currentTime) / 1000;
}

module.exports = {
	checkBirthday,
	checkHoliday,
	secsToMidnight
};
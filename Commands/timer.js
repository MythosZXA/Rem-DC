const { SlashCommandBuilder } = require('@discordjs/builders');
const { Timers } = require('../sequelize');

/**
 * It takes the user's input, validates it, and then sends a message to the user after the specified
 * amount of time
 * @param interaction - Interaction event that holds hours, minutes, and message
 */
async function execute(interaction, rem) {
	const duration = calculateDuration(interaction);
	if (!validateDuration(interaction, duration)) return;

	// confirmation message
	interaction.reply({
		content: 'I will let you know when time is up!',
		ephemeral: true,
	});
	// save info to db for the instance that Rem restarts mid-timer
	const timers = rem.remDB.get('timers');
	const expirationDatetime = new Date();
	expirationDatetime.setMinutes(expirationDatetime.getMinutes() + duration);
	const timerMessage = interaction.options.getString('message');
	const user = interaction.user;		 // interaction object expires after 15 mins
	const timer = {
		expiration_time: expirationDatetime.getTime(),
		message: timerMessage,
		user_id: user.id
	};
	timers.push(timer);
	// set timer
	setTimeout(() => {
		if (timerMessage) user.send(timerMessage);
		else user.send('Time is up!');
	}, 1000 * 60 * duration);
}

/**
 * Calculates the duration of the timer from the hours and minutes attached to the interaction
 * @param interaction - Interaction event that holds hours, minutes, and message
 * @returns The duration of the timer in minutes
 */
function calculateDuration(interaction) {
	const hrs = interaction.options.getInteger('hr');
	const mins = interaction.options.getInteger('min');
	if (hrs < 0 || mins < 0) {
		return -1;
	} else {
		let duration = 0;
		if (hrs) duration += hrs * 60;
		if (mins) duration += mins;
		return duration;
	}
}

/**
 * Checks if the timer duration is a reasonable number
 * @param interaction - Interaction event used to access server's emojis
 * @param duration - The duration of the timer in minutes
 * @returns a boolean value that determines the continuation of the command
 */
function validateDuration(interaction, duration) {
	const remjudge = interaction.client.emojis.cache.find(emoji => emoji.name === 'remjudge');
	if (duration == 0) {
		interaction.reply({
			content: `Why are you even setting a timer ${remjudge}`,
			ephemeral: true,
		});
		return false;
	} else if (duration < 0) {
		interaction.reply({
			content: `Please don't enter negative values ${remjudge}`,
			ephemeral: true,
		});
		return false;
	} else {
		return true;
	}
}

/**
 * It sets up timers for all unexpired timers in the database, and sends a message to the user for all
 * expired timers in the database
 * @param rem - the Discord client
 */
function setupTimers(rem) {
	const timers = rem.remDB.get('timers');
	const expiredTimers = timers.filter(timer => timer.expiration_time < (new Date).getTime());
	const unexpiredTimers = timers.filter(timer => timer.expiration_time >= (new Date).getTime());

	// send message for timers that expired while Rem was down
	expiredTimers.forEach(async expiredTimer => {
		const user = await rem.users.fetch(expiredTimer.user_id);
		const timerMessage = expiredTimer.message;
		// send DM to user
		if (timerMessage) user.send(timerMessage);
		else user.send('Time is up!');
		// delete timer (locally) from DB
		const timerIndex = timers.findIndex(timer => timer.id === expiredTimer.id);
		timers.splice(timerIndex, 1);
		// delete timer (directly) from DB
		try { Timers.destroy({ where: { id: expiredTimer.id } }); }
		catch(error) { console.log(error); }
	});

	// set timers for unexpired timers
	unexpiredTimers.forEach(async unexpiredTimer => {
		const user = await rem.users.fetch(unexpiredTimer.user_id);
		const expirationDatetime = new Date(unexpiredTimer.expiration_time);
		const msDuration = expirationDatetime.getTime() - (new Date()).getTime();
		const timerMessage = unexpiredTimer.message;
		setTimeout(() => {
			// send DM to user
			if (timerMessage) user.send(timerMessage);
			else user.send('Time is up!');
			// delete timer (locally) from DB
			const timerIndex = timers.findIndex(timer => timer.id === unexpiredTimer.id);
			timers.splice(timerIndex, 1);
			// delete timer (directly) from DB
			try { Timers.destroy({ where: { id: unexpiredTimer.id } }); }
			catch(error) { console.log(error); }
		}, msDuration);
	});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timer')
		.setDescription('Set a timer')
		.addIntegerOption(option =>
			option.setName('hr')
				.setDescription('How many hours'))
		.addIntegerOption(option =>
			option.setName('min')
				.setDescription('How many minutes'))
		.addStringOption(option =>
			option.setName('message')
				.setDescription('The message you want to be sent when time is up (optional)')),
	execute,
	setupTimers
};
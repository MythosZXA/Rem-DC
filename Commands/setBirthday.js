const { SlashCommandBuilder } = require('@discordjs/builders');

/**
 * It takes in a user's birthday, validates it, and then saves it to the database
 * @param interaction - The interaction object that contains the user's input
 * @returns the success/error message
 */
async function execute(interaction, rem) {
	try {
		// validate input format
		const regex = new RegExp('[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}');
		const birthdayString = interaction.options.getString('birthday', true);
		if (!regex.test(birthdayString)) {		// incorrect format, exit
			interaction.reply({
				content: 'Invalid format, please try again',
				ephemeral: true,
			});
			return;
		}

		if (!validateBirthdate(interaction, birthdayString)) { return; }		// birthday invalid, exit

		// set or update user birthday
		const userID = interaction.user.id;
		const user = rem.remDB.get('users').get(userID);
		user.birthday = birthdayString;
		
		// send confirmation message
		interaction.reply({
			content: 'Birthday set!',
			ephemeral: true,
		});
	} catch(error) {
		console.log(error);
		return interaction.reply({
			content: 'Something went wrong with setting your birthday. Let Toan know!',
			ephemeral: true,
		});
	}
}

/**
 * It checks if the user's birthday is valid
 * @param interaction - The interaction object that was passed to the function
 * @param birthdayString - The birthday string that the user inputs
 * @returns a boolean value indicating the validation result
 */
function validateBirthdate(interaction, birthdayString) {
	const remjudge = interaction.client.emojis.cache.find(emoji => emoji.name === 'remjudge');
	// parse input
	const birthdayFormat = birthdayString.split('/');
	const userMonth = parseInt(birthdayFormat[0]);
	const userDate = parseInt(birthdayFormat[1]);
	const userYear = parseInt(birthdayFormat[2]);
	// validate month
	if (userMonth == 0) {		// zero-th month, exit
		interaction.reply({
			content: `What is month 0?! ${remjudge}`,
			ephemeral: true,
		});
		return false;
	} else if (userMonth < 0) {		// negative month, exit
		interaction.reply({
			content: `Months can't be negative! ${remjudge}`,
			ephemeral: true,
		});
		return false;
	} else if (userMonth > 12) {		// more than 12 month, exit
		interaction.reply({
			content: `There aren't more than 12 months! ${remjudge}`,
			ephemeral: true,
		});
		return false;
	}
	// validate date
	if (userDate == 0) {		// zero-th date, exit
		interaction.reply({
			content: `What is day 0?! ${remjudge}`,
			ephemeral: true,
		});
		return false;
	} else if(userDate < 0) {		// negative date, exit
		interaction.reply({
			content: `Days cannot be negative! ${remjudge}`,
			ephemeral: true,
		});
		return false;
	} else if (userDate > 31) {		// more than 31 day, exit
		interaction.reply({
			content: `There aren't more than 31 days! ${remjudge}`,
			ephemeral: true,
		});
		return false;
	} else if (userDate == 31 && (userMonth == 4 ||
                                userMonth == 6 ||
                                userMonth == 9 ||
                                userMonth == 11)) {		// non-31 day months, exit
		interaction.reply({
			content: `There aren't 31 days in that month! ${remjudge}`,
			ephemeral: true,
		});
		return false;
	} else if (userDate > 29 && userMonth == 2) {		// more than 29 day in Feb, exit
		interaction.reply({
			content: `There aren't that many days in February! ${remjudge}`,
			ephemeral: true,
		});
		return false;
	} else if (userDate == 29 && userMonth == 2) {		// 29 Feb days on specific years
		if ((userYear % 4) != 0) {		// wrong year, exit
			interaction.reply({
				content: `February doesn't have 29 days that year! ${remjudge}`,
				ephemeral: true,
			});
			return false;
		} else {
			interaction.reply({
				content: 'Ooo a special birthday!',
				ephemeral: true,
			});
		}
	}
	// validate year
	let currentYear = new Date().getFullYear();
	let currentMonth = new Date().getMonth() + 1;
	let currentDate = new Date().getDate();
	if ((userYear > currentYear) ||
    ((userYear == currentYear) && (userMonth > currentMonth)) ||
    ((userYear == currentYear) && (userMonth > currentMonth) && (userDate > currentDate))) {
		interaction.reply({
			content: `No time travellers allowed! ${remjudge}`,
			ephemeral: true,
		});
		return false;
	} else if (userYear < (currentYear - 100)) {
		interaction.reply({
			content: `No immortals allowed! ${remjudge}`,
			ephemeral: true,
		});
		return false;
	}

	return true;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set_birthday')
		.setDescription('If you want a birthday message from Rem on your birthday')
		.addStringOption(option => 
			option.setName('birthday')
				.setDescription('MM/DD/YYYY')
				.setRequired(true)),
	execute,
};
const { SlashCommandBuilder } = require("@discordjs/builders");

function execute(interaction, rem) {
	const subcommandName = interaction.options._subcommand;
	this[subcommandName]?.(interaction, rem);
}

function add(interaction, rem) {
	const date = interaction.options._hoistedOptions[0].value;
	const payer = interaction.options._hoistedOptions[1].value;
	const payee = interaction.options._hoistedOptions[2].value;
	const description = interaction.options._hoistedOptions[3]?.value ?? "";

	// validate date string format
	const regex = new RegExp('[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}');
	if (!regex.test(date)) {
		interaction.reply({
			content: 'Invalid format, please try again',
			ephemeral: true,
		});
		return;
	}

	// add to local db
	rem.remDB.get('transactions').push({
		date: date,
		payer: payer,
		payee: payee,
		description: description
	});

	// complete interaction
	interaction.reply({
		content: 'Transaction recorded',
		ephemeral: true
	});
}

function get(interaction, rem) {
	let resultString = 'Date'.padEnd(15) + 'Payer'.padEnd(15) + 'Payee'.padEnd(15) + 'Description'.padEnd(50) + '\n';

	// filter transactions based on search type
	let searchType = interaction.options._hoistedOptions[0].value;
	const input = interaction.options._hoistedOptions[1].value.toLowerCase();
	let filteredTransactions;
	switch (searchType) {
		case 'date':
			// validate date string format
			const regex = new RegExp('[0-9]{1,2}/[0-9]{2}');
			if (!regex.test(input)) {
				interaction.reply({
					content: 'Invalid format, please try again',
					ephemeral: true
				});
				return;
			}
			
			const splitDate = input.split('/');
			filteredTransactions = rem.remDB.get('transactions').filter(transaction =>
				transaction.date.startsWith(splitDate[0]) &&
				transaction.date.endsWith(`20${splitDate[1]}`)
			);
			break;
		case 'payer':
		case 'payee':
		case 'description':
			filteredTransactions = rem.remDB.get('transactions').filter(transaction => 
				transaction[searchType].toLowerCase().includes(input)
			);
			break;
	}

	// build & send results table
	filteredTransactions.forEach(transaction => {
		resultString += `${transaction.date.padEnd(15)}${transaction.payer.padEnd(15)}${transaction.payee.padEnd(15)}${transaction.description.padEnd(50)}`;
	});
	interaction.reply({
		content: `\`\`\`${resultString}\`\`\``,
		ephemeral: true
	});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transaction')
		.setDescription('Transaction History')
		.addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Record a transaction')
				.addStringOption(option =>
					option.setName('date')
						.setDescription('Date of the transaction (MM/DD/YYYY)')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('payer')
						.setDescription('Name of the payer')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('payee')
						.setDescription('Name of the payee')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('description')
						.setDescription('Description of the transaction')))
		.addSubcommand(subcommand =>
			subcommand.setName('get')
				.setDescription('Retrieve transaction records')
				.addStringOption(option =>
					option.setName('search_type')
						.setDescription('Search condition. MM/YY for Date')
						.addChoices(
							{ name: 'Date', value: 'date' },
							{ name: 'Payer', value: 'payer' },
							{ name: 'Payee', value: 'payee' },
							{ name: 'Description', value: 'description' }
						)
						.setRequired(true))
				.addStringOption(option =>
					option.setName('input')
						.setDescription('Corresponding input for desired search type')
						.setRequired(true))),
	execute,
	add,
	get
};
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow } = require('discord.js');

const undoButton = new MessageButton()
	.setCustomId('undo')
	.setLabel('Undo')
	.setStyle('DANGER');
const actionRow = new MessageActionRow().addComponents(undoButton);

const deck = [
	'A-S♠️', 'A-C♣️', 'A-D♦️', 'A-H♥️',
	'2-S♠️', '2-C♣️', '2-D♦️', '2-H♥️',
	'3-S♠️', '3-C♣️', '3-D♦️', '3-H♥️',
	'4-S♠️', '4-C♣️', '4-D♦️', '4-H♥️',
	'5-S♠️', '5-C♣️', '5-D♦️', '5-H♥️',
	'6-S♠️', '6-C♣️', '6-D♦️', '6-H♥️',
	'7-S♠️', '7-C♣️', '7-D♦️', '7-H♥️',
	'8-S♠️', '8-C♣️', '8-D♦️', '8-H♥️',
	'9-S♠️', '9-C♣️', '9-D♦️', '9-H♥️',
	'10-S♠️', '10-C♣️', '10-D♦️', '10-H♥️',
	'J-S♠️', 'J-C♣️', 'J-D♦️', 'J-H♥️',
	'Q-S♠️', 'Q-C♣️', 'Q-D♦️', 'Q-H♥️',
	'K-S♠️', 'K-C♣️', 'K-D♦️', 'K-H♥️',
];
const faceCards = [
	'J-S♠️', 'J-C♣️', 'J-D♦️', 'J-H♥️',
	'Q-S♠️', 'Q-C♣️', 'Q-D♦️', 'Q-H♥️',
	'K-S♠️', 'K-C♣️', 'K-D♦️', 'K-H♥️',
	'A-S♠️', 'A-C♣️', 'A-D♦️', 'A-H♥️',
];
const cardTypes = [
	'S♠️', 'C♣️', 'D♦️', 'H♥️'
];
let tableChannel;
let p1 = [], p2 = [], p3 = [], p4 = [];
let p1DeckMessage, p2DeckMessage, p3DeckMessage, p4DeckMessage;
let playerMembers = [], placement = [];
let recentMessage;

async function execute(interaction) {
	tableChannel = await interaction.guild.channels.fetch('933842239505969252');
	// check if this is the play or cancel subcommand
	const subcommandName = interaction.options._subcommand;
	switch (subcommandName) {
		case 'play':
			play(interaction);
			return;
		case 'cancel':
			cancel(interaction);
			return;
	}
	// check if the command is sent in table channel
	if (interaction.channelId !== '933842239505969252') {             // not correct channel, exit
		interaction.reply({
			content: 'Please play 13 in the table channel',
			ephemeral: true,
		});
		return;
	}
	// check if there is an active 13 game
	if (playerMembers.length !== 0) {                                 // ongoing game, exit
		interaction.reply({
			content: 'There is an ongoing game. Please try again later',
			ephemeral: true,
		});
		return;
	}
	// check if inputted nicknames are valid players
	if (!(await validatePlayers(interaction))) return;                // invalid players, exit
	// give roles/assign channels
	await playerMembers[0].roles.add('934200192020910170');
	await playerMembers[1].roles.add('934200300313640980');
	await playerMembers[2].roles.add('934200341875015741');
	await playerMembers[3].roles.add('934200390696722532');
	// shuffle and deal deck to 4 players
	let deckCopy = [...deck];
	for (let i = 0; i < 52; i++) {
		const cardIndex = Math.floor(Math.random() * deckCopy.length);
		if (p1.length < 13) p1.push(deckCopy.splice(cardIndex, 1)[0]);
		else if (p2.length < 13) p2.push(deckCopy.splice(cardIndex, 1)[0]);
		else if (p3.length < 13) p3.push(deckCopy.splice(cardIndex, 1)[0]);
		else if (p4.length < 13) p4.push(deckCopy.splice(cardIndex, 1)[0]);
	}
	// sort players' decks in ascending order
	deckSort(p1);
	deckSort(p2);
	deckSort(p3);
	deckSort(p4);
	// send decks to respective channels
	const p1Channel = await interaction.guild.channels.fetch('933842013223280720');
	const p2Channel = await interaction.guild.channels.fetch('933842030654795846');
	const p3Channel = await interaction.guild.channels.fetch('933842048530927726');
	const p4Channel = await interaction.guild.channels.fetch('933842062007218196');
	p1DeckMessage = await p1Channel.send(p1.join('\n'));
	p2DeckMessage = await p2Channel.send(p2.join('\n'));
	p3DeckMessage = await p3Channel.send(p3.join('\n'));
	p4DeckMessage = await p4Channel.send(p4.join('\n'));
	// send confirmation message
	interaction.reply(
		'Started a game of 13 with ' +
    `${playerMembers[0].nickname}, ${playerMembers[1].nickname}, ` +
    `${playerMembers[2].nickname}, ${playerMembers[3].nickname}\n`
	);
}

async function validatePlayers(interaction) {
	// add game requester as player
	const interactionMember = interaction.member;
	playerMembers.push(interactionMember);
	// get invited players' nicknames
	let playerNicknames = [];
	for (let i = 0; i <= 2; i++) {
		playerNicknames.push(interaction.options._hoistedOptions[i].value);
	}
	const guildMembers = await interaction.guild.members.fetch();
	// validate nicknames
	for (let i = 0; i <= 2; i++) {
		const guildMember = guildMembers.find(guildMember => 
			guildMember.nickname?.toLowerCase() === playerNicknames[i].toLowerCase());
		if (guildMember) {                                              // valid nickname, add player
			playerMembers.push(guildMember);
		} else {                                                        // invalid nickname, exit
			interaction.reply({
				content: 'I could not anyone with that nickname!',
				ephemeral: true,
			});
			return false;
		}
	}
	return true;
}

function deckSort(playerCards) {
	// sort 3-10 cards
	for (let i = 3; i <= 10; i++) {
		for (let j = 0; j <= 3; j++) {
			const cardIndex = playerCards.findIndex(card =>
				card.includes(i.toString()) &&
        card.includes(cardTypes[j]));
			if (cardIndex >= 0) {
				playerCards.push(playerCards.splice(cardIndex, 1)[0]);
			}
		}
	}
	// sort J-A cards
	for (let i = 0; i < faceCards.length; i++) {
		for (let j = 0; j <= 3; j++) {
			const cardIndex = playerCards.findIndex(card =>
				card.includes(faceCards[i]));
			if (cardIndex >= 0) {
				playerCards.push(playerCards.splice(cardIndex, 1)[0]);
			}
		}
	}
	// sort 2 (pig) cards
	for (let i = 0; i <= 3; i++) {
		const cardIndex = playerCards.findIndex(card =>
			card.includes(`2-${cardTypes[i]}`));
		if (cardIndex >= 0) {
			playerCards.push(playerCards.splice(cardIndex, 1)[0]);
		}
	}
}

async function play(interaction) {
	// check if this member is a player
	if (!playerMembers.find(member => member === interaction.member)) {
		interaction.reply({
			content: 'You are not a player in the current game!',
			ephemeral: true,
		});
		return;
	}
	// get player's 13 info
	const playerMemberIndex = playerMembers.findIndex(member => member === interaction.member);
	let playerDeck, playerMessage;
	switch(playerMemberIndex) {
		case 0:
			playerDeck = p1;
			playerMessage = p1DeckMessage;
			break;
		case 1:
			playerDeck = p2;
			playerMessage = p2DeckMessage;
			break;
		case 2:
			playerDeck = p3;
			playerMessage = p3DeckMessage;
			break;
		case 3:
			playerDeck = p4;
			playerMessage = p4DeckMessage;
			break;
	}
	// determine which cards to play
	const revertDeck = [...playerDeck];                                             // save current deck in case of undo
	let playDeck = [];                                                              // represents cards being played
	const playIndices = interaction.options._hoistedOptions[0].value.split(',');    // card locations in deck
	if (playIndices.length > playerDeck.length) {                                   // playing more cards than exists, exit
		interaction.reply({
			content: 'You do not have that many cards',
			ephemeral: true,
		});
		return;
	} else if (playIndices.find(playIndex => playIndex > playerDeck.length - 1)) {  // playing an out of bounds card, exit
		interaction.reply({
			content: 'A card position is out of bounds!',
			ephemeral: true,
		});
		return;
	}
	// transfer cards from player deck to play deck
	for (let i = 0; i < playIndices.length; i++) {
		let cardIndex = parseInt(playIndices[i]);
		cardIndex -= i;
		playDeck.push(playerDeck.splice(cardIndex, 1)[0]);
	}
	// play the cards by sending it to table
	if (recentMessage) recentMessage.edit({ components: [] });                      // remove undo button from last message
	recentMessage = await tableChannel.send({
		content: `p${playerMemberIndex + 1} ${interaction.member.nickname}: ${playDeck.join(',')}`,
		components: [actionRow],
	});
	// attach 13 related data to message
	recentMessage.buttonType = '13';
	recentMessage.originalMember = interaction.member;
	recentMessage.revertDeck = revertDeck;
	// check post-play condition
	if (playerDeck.length == 0) {                                                   // no more cards, win
		playerMessage.edit('No more cards');
		placement.push(interaction.member);
		simulateWin(interaction);
	} else {                                                                        // more cards, keep going
		playerMessage.edit(playerDeck.join('\n'));                                    // remove played cards from hand
		await interaction.reply('Played');
		interaction.deleteReply();
	}
}

async function simulateWin(interaction) {
	// distribute coins
	const memberNickname = interaction.member?.nickname;
	let placementString = '';
	const playerPlacement = placement.findIndex(member => member === interaction.member);
	switch (playerPlacement) {
		case 0:
			placementString = 'You came in 1st place';
			tableChannel.send(`${memberNickname} won 1st place!`);
			break;
		case 1:
			placementString = 'You came in 2nd place';
			tableChannel.send(`${memberNickname} won 2nd place!`);
			break;
		case 2:
			placementString = 'You came in 3rd place';
			tableChannel.send(`${memberNickname} won 3rd place`);
			break;
		case 3:
			placementString = 'You came in last place';
			tableChannel.send(`${memberNickname} placed last`);
			break;
	}
	// send confirmation message
	interaction.reply({
		content: placementString,
		ephemeral: true,
	});
}

function undo(interaction) {
	// get player's 13 info
	const playerMemberIndex = playerMembers.findIndex(member => member === interaction.member);
	let playerDeck, playerMessage;
	switch(playerMemberIndex) {
		case 0:
			p1 = interaction.message.revertDeck;                // revert deck back to prior-play
			playerDeck = p1;                                    // deck to display after undo
			playerMessage = p1DeckMessage;                      // message displaying the deck
			break;
		case 1:
			p2 = interaction.message.revertDeck;
			playerDeck = p2;
			playerMessage = p2DeckMessage;
			break;
		case 2:
			p3 = interaction.message.revertDeck;
			playerDeck = p3;
			playerMessage = p3DeckMessage;
			break;
		case 3:
			p4 = interaction.message.revertDeck;
			playerDeck = p4;
			playerMessage = p4DeckMessage;
			break;
	}
	// undo last played cards
	interaction.message.delete();                           // remove the played cards from table
	recentMessage = undefined;                              // recent message deleted
	playerMessage.edit(playerDeck.join('\n'));              // put back the cards to player's hand
}

function cancel(interaction) {
	// if there are no players, exit
	if (playerMembers.length === 0) {
		interaction.reply({
			content: 'There isn\'t an ongoing game',
			ephemeral: true,
		});
		return;
	}
	// validate game canceller
	if (!playerMembers.find(member => member === interaction.member)) {
		interaction.reply({
			content: 'You cannot cancel the game since you aren\'t a player',
			ephemeral: true,
		});
		return;
	}
	// cancel game by removing roles and resetting variables
	tableChannel.bulkDelete(80);
	p1DeckMessage.delete().then(() => p1DeckMessage = undefined);
	p2DeckMessage.delete().then(() => p2DeckMessage = undefined);
	p3DeckMessage.delete().then(() => p3DeckMessage = undefined);
	p4DeckMessage.delete().then(() => p4DeckMessage = undefined);
	p1 = [], p2 = [], p3 = [], p4 = [];
	playerMembers[0].roles.remove('934200192020910170');
	playerMembers[1].roles.remove('934200300313640980');
	playerMembers[2].roles.remove('934200341875015741');
	playerMembers[3].roles.remove('934200390696722532');
	playerMembers = [], investedPlayerUsers = [], placement = [];
	recentMessage = undefined, moneyPool = undefined;
	// send confirmation message
	interaction.reply({
		content: 'Current game canceled',
		ephemeral: true,
	});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('13')
		.setDescription('Play a game of 13')
		.addSubcommand(subcommand =>
			subcommand.setName('start')
				.setDescription('Start a game of 13')
				.addStringOption(option =>
					option.setName('player2_nickname')
						.setDescription('The nickname of the second player')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('player3_nickname')
						.setDescription('The nickname of the third player')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('player4_nickname')
						.setDescription('The nickname of the fourth player')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('play')
				.setDescription('Play cards in your hand')
				.addStringOption(option =>
					option.setName('cards')
						.setDescription('The cards you want to play separated by commas => 0,3,4,6,9 (ASCENDING)')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('cancel')
				.setDescription('Cancel existing game')),
	execute,
	play,
	undo,
	cancel,
};
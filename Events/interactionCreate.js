module.exports = {
	name: 'interactionCreate',
	many: true,
	async execute(interaction, rem) {
		if (interaction.isApplicationCommand()) {		// slash commands
			const consoleChannel = rem.serverChannels.get('console');
			consoleChannel.send(`${interaction.user.tag} used: ${interaction.commandName} (${interaction.commandId})`);

			const command = rem.commands.get(interaction.commandName);
			if (!command) return;		// if there isn't a file with the command name

			// execute command, catch error if unsuccessful
			try {
				command.execute(interaction, rem);
			} catch (error) {
				console.error(error);
				interaction.reply({ 
					content: 'There was an error while executing this command. Let Toan know!',
					ephemeral: true 
				});
			}
		} else if (interaction.isSelectMenu()) {              // select menu interactions
			
		} else if (interaction.isButton()) {                  // button interactions
			const interactionMember = interaction.member;
			const originalMember = interaction.message.originalMember;
			const buttonType = interaction.message.buttonType;
			const buttonName = interaction.customId;
			switch (buttonType) {
				case '13':                                        // 13 buttons
					const thirteenCmds = rem.commands.get('13');
					// validate 13 button pressers
					if (interactionMember !== originalMember) {
						interaction.reply({
							content: 'You cannot interact with this button',
							ephemeral: true,
						});
						return;
					}
					switch (buttonName) {
						case 'undo':
							thirteenCmds.undo(interaction);
							break;
					}
					break;
			}
		}
	}
};
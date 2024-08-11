const { SlashCommandBuilder } = require("discord.js");

function execute(interaction) {
  if (interaction.user.id !== process.env.toan) return;

  interaction.reply({ 
    content: 'Rem is going to sleep! おやすみなさい',
    ephemeral: true 
  });
	process.kill(process.pid, 'SIGTERM');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sleep')
    .setDescription('Turn Rem off (Restricted)'),
  execute
};
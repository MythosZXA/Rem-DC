import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';

const commands = [];
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));
(async () => {
  for (const file of commandFiles) {
    const command = (await import(`./Commands/${file}`)).default;
    commands.push(command.data.toJSON());
  }
})();

const rest = new REST({ version: '9' }).setToken(process.env.token);
(async () => {
  try {
    console.log('Started refreshing application (slash) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.clientId, process.env.guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (slash) commands.');
  } catch (error) {
    console.error(error);
  }
})();
import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const rest = new REST({ version: '9' }).setToken(process.env.token);
(async () => {
  try {
    await rest.delete(
      `${Routes.applicationGuildCommands(process.env.clientId, process.env.guildId)}/commandID`
    );

    console.log('Successfully deleted command');
  } catch (error) {
    console.error(error);
  }
})();
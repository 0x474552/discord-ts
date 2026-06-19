import { Events } from 'discord.js';
import type { BotEvent } from '../types';
import { handleSlashCommandInteraction } from '../handlers/interaction/CommandInteractionHandler';

const event: BotEvent<typeof Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    // The starter only handles slash commands by default. Add more interaction
    // branches here later if you introduce buttons, modals, or menus.
    if (!interaction.isChatInputCommand()) {
      return;
    }

    await handleSlashCommandInteraction(interaction, client);
  },
};

export default event;

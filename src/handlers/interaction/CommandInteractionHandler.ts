import {
  MessageFlags,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
} from 'discord.js';
import type { BotClient, BotCommand } from '../../types';
import { configManager } from '../../config/ConfigManager';
import { buildEmbed } from '../../utils/embed';
import { log } from '../../utils/logger';

function getMemberRoleIds(interaction: ChatInputCommandInteraction): string[] {
  if (!interaction.inCachedGuild()) {
    return [];
  }

  // We normalize to raw role IDs so the config-based permission helper stays
  // independent from the full Discord member object.
  return interaction.member.roles.cache.map((role) => role.id);
}

function hasDiscordPermissions(
  interaction: ChatInputCommandInteraction,
  command: BotCommand,
): boolean {
  const requiredPermissions = command.requiredDiscordPermissions ?? [];

  if (requiredPermissions.length === 0) {
    return true;
  }

  if (!interaction.memberPermissions) {
    return false;
  }

  return interaction.memberPermissions.has(requiredPermissions);
}

export async function handleSlashCommandInteraction(
  interaction: ChatInputCommandInteraction,
  client: BotClient,
): Promise<void> {
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return;
  }

  if (configManager.config.bot.maintenanceMode && !configManager.isDeveloper(interaction.user.id)) {
    await interaction.reply({
      embeds: [buildEmbed('warning').setDescription('The bot is currently in maintenance mode.')],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const userLevel = configManager.getPermissionLevel(
    getMemberRoleIds(interaction),
    interaction.user.id,
  );
  const requiredLevel = command.permissionLevel ?? 0;
  // Each command can choose whether it trusts bot config levels, Discord native
  // permission flags, or both.
  const permissionMode =
    command.permissionMode ?? (command.requiredDiscordPermissions?.length ? 'discord' : 'config');
  const passesConfigCheck = userLevel >= requiredLevel;
  const passesDiscordCheck = hasDiscordPermissions(interaction, command);

  const hasAccess =
    permissionMode === 'both'
      ? passesConfigCheck && passesDiscordCheck
      : permissionMode === 'discord'
        ? passesDiscordCheck
        : passesConfigCheck;

  if (!hasAccess) {
    // Keeping the failure reason close to the chosen permission mode makes it
    // easier for template users to swap strategies without hunting through
    // multiple helper files.
    await interaction.reply({
      embeds: [
        buildEmbed('error').setDescription(
          permissionMode === 'discord'
            ? 'You do not have the required Discord permissions to use this command.'
            : permissionMode === 'both'
              ? 'You must satisfy both the configured bot level and Discord permissions for this command.'
              : 'You do not have permission to use this command.',
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await command.execute(interaction, client);
    log.success(`/${command.data.name} used by ${interaction.user.tag}`, 'interaction');
  } catch (error) {
    const payload = {
      embeds: [
        buildEmbed('error').setDescription('Something went wrong while running that command.'),
      ],
      flags: MessageFlags.Ephemeral,
    } satisfies InteractionReplyOptions;

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }

    log.error(`/${command.data.name} failed: ${(error as Error).message}`, 'interaction');
  }
}

import {
  ChannelType,
  type GuildBasedChannel,
  type GuildMember,
  type PartialGuildMember,
  type TextChannel,
} from 'discord.js';
import { buildEmbed, formatString, type EmbedKind } from './embed';
import { log } from './logger';

type MemberLike = GuildMember | PartialGuildMember;

export interface MemberMessageConfig {
  enabled: boolean;
  channelId: string;
  message: string;
  useEmbed: boolean;
  title?: string;
}

export interface AutoRoleConfig {
  enabled: boolean;
  botRoleIds: string[];
  humanRoleIds: string[];
}

interface SendMemberEventMessageOptions {
  member: MemberLike;
  settings: MemberMessageConfig | undefined;
  embedKind: EmbedKind;
  fallbackTitle: string;
  logContext: string;
}

function resolveTextChannel(channel: GuildBasedChannel | undefined): TextChannel | null {
  if (!channel || channel.type !== ChannelType.GuildText) {
    return null;
  }

  return channel as TextChannel;
}

export function buildMemberTemplateVariables(member: MemberLike): Record<string, string | number> {
  return {
    userMention: `<@${member.id}>`,
    username: member.user.username,
    userTag: member.user.tag,
    guildName: member.guild.name,
    memberCount: member.guild.memberCount,
  };
}

export async function sendMemberEventMessage({
  member,
  settings,
  embedKind,
  fallbackTitle,
  logContext,
}: SendMemberEventMessageOptions): Promise<void> {
  if (!settings?.enabled) {
    return;
  }

  const channel = resolveTextChannel(member.guild.channels.cache.get(settings.channelId));
  if (!channel) {
    log.warn(
      `Skipping message because channel ${settings.channelId} is missing or not a text channel.`,
      logContext,
    );
    return;
  }

  const content = formatString(settings.message, buildMemberTemplateVariables(member));

  if (!settings.useEmbed) {
    await channel.send(content);
    return;
  }

  await channel.send({
    embeds: [
      buildEmbed(embedKind)
        .setTitle(settings.title || fallbackTitle)
        .setDescription(content)
        .setThumbnail(member.user.displayAvatarURL()),
    ],
  });
}

export async function sendMemberDirectMessage(
  member: GuildMember,
  enabled: boolean | undefined,
  template: string | undefined,
  logContext: string,
): Promise<void> {
  if (!enabled || !template) {
    return;
  }

  const content = formatString(template, buildMemberTemplateVariables(member));
  await member.send(content).catch((error: Error) => {
    log.warn(`Failed to send member DM: ${error.message}`, logContext);
  });
}

export async function applyConfiguredAutoRoles(
  member: GuildMember,
  settings: AutoRoleConfig | undefined,
  logContext: string,
): Promise<void> {
  if (!settings?.enabled) {
    return;
  }

  const roleIds = member.user.bot ? settings.botRoleIds : settings.humanRoleIds;

  // Keep role assignment intentionally simple. Projects that need conditions
  // such as account age, invite tracking, or onboarding steps can branch here.
  // If you prefer event-local logic, move this loop into guildMemberAdd.ts.
  for (const roleId of roleIds) {
    await member.roles.add(roleId).catch((error: Error) => {
      log.warn(`Failed to add role ${roleId}: ${error.message}`, logContext);
    });
  }
}

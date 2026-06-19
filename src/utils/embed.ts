import { EmbedBuilder, type ColorResolvable } from 'discord.js';
import { config } from '../config/ConfigManager';

export type EmbedKind = 'primary' | 'success' | 'warning' | 'error' | 'info';

export function formatString(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(variables[key] ?? `{${key}}`));
}

export function buildEmbed(kind: EmbedKind = 'primary'): EmbedBuilder {
  // Fallback color for embedded message
  const fallbackColor = config.embedColors.primary ?? '#5865F2';

  // Resolve embed color from config.json
  const color = (config.embedColors[kind] ?? fallbackColor) as ColorResolvable;
  const embed = new EmbedBuilder().setColor(color);

  if (config.embedFooter?.enabled !== false) {
    const baseText = formatString(
      // use config.json text template or default to Powered by DiscordBot
      config.embedFooter?.textTemplate ?? 'Powered by {botName}', {
        botName: config.bot.name,
      }
    );

    // config.json show timestamp true or false
    const footerText = config.embedFooter?.showTimestamp
      ? `${baseText} | ${new Date().toLocaleString()}`
      : baseText;

    embed.setFooter({ text: footerText });
  }

  return embed;
}

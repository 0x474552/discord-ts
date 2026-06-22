import { EmbedBuilder, type ColorResolvable } from 'discord.js';
import { configManager } from '../config/ConfigManager';

// Embed colour presets
export type EmbedKind = 'primary' | 'success' | 'warning' | 'error' | 'info';

/**
 *
 * @param template String containing placeholders.
 * @param variables Values used to replace placeholders.
 * @returns The formatted string.
 *
 * @example
 * formatString('Hello {user}', { user: 'John' });
 * // "Hello John"
 */
export function formatString(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(variables[key] ?? `{${key}}`));
}

/**
 * Creates an embed using the configured color palette and footer settings.
 *
 * If footer timestamps are enabled, the current local date and time
 * are appended to the footer text.
 *
 * @param kind Embed color preset.
 * @returns A configured embed builder.
 */
export function buildEmbed(kind: EmbedKind = 'primary'): EmbedBuilder {
  const config = configManager.config;
  const fallbackColor = config.embedColors.primary ?? '#5865F2';

  const color = (config.embedColors[kind] ?? fallbackColor) as ColorResolvable;
  const embed = new EmbedBuilder().setColor(color);

  if (config.embedFooter?.enabled !== false) {
    const baseText = formatString(config.embedFooter?.textTemplate ?? 'Powered by {botName}', {
      botName: config.bot.name,
    });

    const footerText = config.embedFooter?.showTimestamp
      ? `${baseText} | ${new Date().toLocaleString()}`
      : baseText;

    embed.setFooter({ text: footerText });
  }

  return embed;
}

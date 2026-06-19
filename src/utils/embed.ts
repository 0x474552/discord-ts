import { EmbedBuilder } from 'discord.js';
import { getColourInt } from './colours';
import type { ColourName } from './colours';

/**
 * Pre-configured embed builders for common use cases.
 * Use: buildEmbed('success').setTitle('...').setDescription('...')
 *
 * You can also create a custom embed with any colour name:
 *   customEmbed('teal').setTitle('My Title')
 */

type EmbedStyle = 'success' | 'error' | 'info' | 'warning';

const styleConfig: Record<EmbedStyle, { colour: ColourName; defaultTitle: string }> = {
  success: { colour: 'green', defaultTitle: '✅ Success' },
  error: { colour: 'red', defaultTitle: '❌ Error' },
  info: { colour: 'blue', defaultTitle: 'ℹ️ Info' },
  warning: { colour: 'yellow', defaultTitle: '⚠️ Warning' },
};

/**
 * Creates a pre-styled embed for common message types.
 * @example buildEmbed('success').setDescription('Operation completed.')
 */
export function buildEmbed(style: EmbedStyle): EmbedBuilder {
  const config = styleConfig[style];
  return new EmbedBuilder()
    .setColor(getColourInt(config.colour))
    .setTitle(config.defaultTitle)
    .setTimestamp();
}

/**
 * Creates a custom embed using any colour from the COLOUR_MAP.
 * @example customEmbed('pink').setTitle('Hello').setDescription('World')
 */
export function customEmbed(colour: ColourName = 'blue'): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(getColourInt(colour))
    .setTimestamp();
}
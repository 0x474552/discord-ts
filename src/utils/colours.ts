/**
 * Colour map for consistent embed colours across the bot.
 * Exports hex colours, a typed helper, and an integer converter.
 *
 * Usage:
 *   import { getColourInt, COLOUR_MAP } from '../utils/colours';
 *   .setColor(getColourInt('blue'))
 */

export const COLOUR_MAP = {
  blue: '#3498DB',
  red: '#E74C3C',
  yellow: '#F1C40F',
  green: '#2ECC71',
  purple: '#9B59B6',
  orange: '#E67E22',
  teal: '#1ABC9C',
  cyan: '#00BCD4',
  pink: '#FF4D8D',
  white: '#FFFFFF',
  grey: '#99AAB5',
  black: '#23272A',
  giveaway: '#FFD700',
  raffle: '#800000',
} as const;

export type ColourName = keyof typeof COLOUR_MAP;

/**
 * Returns a hex colour string by name, falling back to 'grey'.
 * @example getColour('blue') // '#3498DB'
 */
export function getColour(name: string, fallback: ColourName = 'grey'): string {
  const key = name.trim().toLowerCase() as ColourName;
  return COLOUR_MAP[key] ?? COLOUR_MAP[fallback];
}

/**
 * Returns an integer colour value (for EmbedBuilder.setColor) by name.
 * @example getColourInt('blue') // 0x3498DB
 */
export function getColourInt(name: string, fallback: ColourName = 'grey'): number {
  return parseInt(getColour(name, fallback).replace('#', ''), 16);
}

/**
 * Pre-formatted slash command choices for colour selection.
 */
export const COLOUR_SLASH_CHOICES: Array<{ name: string; value: string }> = [
  { name: 'Blue', value: 'blue' },
  { name: 'Red', value: 'red' },
  { name: 'Yellow', value: 'yellow' },
  { name: 'Green', value: 'green' },
  { name: 'Purple', value: 'purple' },
  { name: 'Orange', value: 'orange' },
  { name: 'Teal', value: 'teal' },
  { name: 'Cyan', value: 'cyan' },
  { name: 'Pink', value: 'pink' },
  { name: 'Grey', value: 'grey' },
  { name: 'White', value: 'white' },
  { name: 'Giveaway', value: 'giveaway' },
  { name: 'Raffle', value: 'raffle' },
];
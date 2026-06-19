# Discord.js TypeScript Bot Template

A clean, production-ready boilerplate for building **Discord.js v14** bots in **TypeScript**. This template gives you a solid foundation with command handling, event management, and best practices built in — so you can focus on writing features, not boilerplate.

---

# Things to note before commencing

This boilerplate code is derived from my own discord bot in typescript and there are still edits and changes to work on, to ensure it works properly as a "template" for people to work on.

---

## 📦 Features

- **🧩 Slash Command Handler** – Auto-loads commands from `src/commands/` with subdirectory support
- **📡 Event Handler** – Auto-loads events from `src/events/`
- **🛡️ TypeScript** – Full type safety with `discord.js` v14 types
- **🔄 Flexible Permission System** – Choose between integer levels, Discord permissions, or role-based checks
- **💎 Embed Builder Utility** – Pre-made embed helpers (success, error, info, warning) using the colour map
- **🎨 Colour Map Utility** – Consistent embed colours with `getColourInt()`, `COLOUR_MAP`, and slash command choices
- **🧾 Logger** – Simple coloured console logger with levels
- **⚙️ Dotenv Config** – Environment variable management via `.env`
- **🧹 Clean Structure** – Organised by feature (commands/, events/, utils/, types/)
- **🔒 Graceful Shutdown** – Handles `SIGINT` / `SIGTERM` cleanly

---

## 🚀 Quick Start

### 1. Clone the template

```bash
git clone <your-repo-url> my-bot
cd my-bot
```

Or copy the `template/` folder manually.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here # Optional: Guild ID for instant command registration (development only)
```

### 4. Register slash commands

```bash
npm run register
```

### 5. Start the bot

```bash
npm run dev
```

---

## 📁 Project Structure

```
template/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                # Bot entry point
│   ├── deploy-commands.ts      # Standalone command registration
│   ├── types/
│   │   ├── index.ts            # BotCommand, BotEvent, PermissionConfig, checkPermissions()
│   │   └── client.ts           # BotClient interface
│   ├── handlers/
│   │   ├── CommandHandler.ts   # Recursive command loader + REST registration
│   │   └── EventHandler.ts     # Auto-loads events from filesystem
│   ├── commands/
│   │   └── general/
│   │       └── ping.ts         # Example ping command with embed
│   ├── events/
│   │   ├── ready.ts            # Logs bot login info
│   │   └── interactionCreate.ts# Routes commands with permission checks
│   └── utils/
│       ├── colours.ts          # Colour map, getColourInt(), COLOUR_SLASH_CHOICES
│       ├── embed.ts            # buildEmbed() and customEmbed() using colours
│       └── logger.ts           # Coloured console logger
```

---

## 🧩 Creating a Command

1. Create a new `.ts` file in `src/commands/<category>/` (e.g. `src/commands/moderation/ban.ts`)
2. Use the `BotCommand` interface, optionally adding a `permissions` field:

```ts
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import type { BotCommand } from '../../types';
import { buildEmbed } from '../../utils/embed';

const command: BotCommand = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server.')
    .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  // Permission config (choose one of three modes):
  // Mode 1 — Integer level (0=everyone, 1=mod, 2=admin, 3=owner)
  // permissions: { type: 'integer', level: 1 },

  // Mode 2 — Discord PermissionFlagsBits
  // permissions: { type: 'discord', permissions: [PermissionFlagsBits.BanMembers] },

  // Mode 3 — Role-based (name or ID)
  // permissions: { type: 'role', roles: ['Moderator', 'Admin'] },

  async execute(interaction, client) {
    const user = interaction.options.getUser('user', true);
    await interaction.guild?.members.ban(user);
    await interaction.reply({
      embeds: [
        buildEmbed('success').setDescription(`Banned ${user.tag}.`),
      ],
      ephemeral: true,
    });
  },
};

export default command;
```

3. The handler loads it automatically. Run `npm run register` to sync.

---

## 🧩 Creating an Event

Create a new `.ts` file in `src/events/`:

```ts
import type { BotEvent } from '../types';

const event: BotEvent = {
  name: 'guildMemberAdd',
  once: false,
  async execute(...args: unknown[]) {
    const [member] = args;
    console.log(`${(member as any).user?.tag ?? 'Unknown'} joined ${(member as any).guild?.name}`);
  },
};

export default event;
```

---

## 🎨 Using the Colour Map

The `colours.ts` utility provides a central colour palette for all embeds:

```ts
import { getColourInt, COLOUR_SLASH_CHOICES } from '../utils/colours';
import { EmbedBuilder } from 'discord.js';

const embed = new EmbedBuilder()
  .setColor(getColourInt('teal'))
  .setTitle('Custom Embed');
```

`COLOUR_SLASH_CHOICES` is ready to use in slash command colour options — just pass it directly to `.addChoices()`.

---

## 🔐 Permission System

Three modes are supported; choose the one that fits your project.

| Mode        | Config                                      | Behaviour                                          |
|-------------|---------------------------------------------|-----------------------------------------------------|
| `integer`   | `{ type: 'integer', level: 0-3 }`          | 0=everyone, 1=moderator, 2=admin, 3=owner          |
| `discord`   | `{ type: 'discord', permissions: [] }`     | Checks Discord permission flags directly            |
| `role`      | `{ type: 'role', roles: ['Mod', 'Admin'] }`| Matches member roles by name or ID                  |

Extend `PERMISSION_LEVELS` and `PERMISSION_LEVEL_MAP` in `src/types/index.ts` to add more integer levels.

---

## 🔧 Build & Run

| Command            | Description                              |
|--------------------|------------------------------------------|
| `npm run dev`      | Run with `tsx watch` (hot reload)        |
| `npm run build`    | Compile TypeScript to `dist/`            |
| `npm start`        | Run compiled JavaScript from `dist/`     |
| `npm run register` | Register slash commands with Discord     |
| `npm run lint`     | Lint source files                        |

---

## 📄 Environment Variables

| Variable        | Required | Description                              |
|-----------------|----------|------------------------------------------|
| `DISCORD_TOKEN` | ✅ Yes   | Bot token from Discord Developer Portal  |
| `CLIENT_ID`     | ✅ Yes   | Application ID (for slash commands)      |
| `GUILD_ID`      | ❌ No    | Guild ID for instant command registration |

---

## 🧰 Extending the Bot

This template is intentionally minimal so you can extend it however you like:

- **Add a database** – Prisma, Drizzle, MySQL, SQLite, MongoDB
- **Add moderation commands** – ban, kick, mute, warn
- **Add fun commands** – dice, coinflip, trivia
- **Add an economy system** – points, levels, inventory
- **Add music playback** – @discordjs/voice + play-dl
- **Add unit tests** – Vitest, Jest
- **Add CI/CD** – GitHub Actions

---

## 📝 License

MIT – Free to use, modify, and distribute.
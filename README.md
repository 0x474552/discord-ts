# Discord Bot Template

This is a small Discord.js + TypeScript starter meant to be easy to extend.
The runtime keeps command and event loading explicit so new projects stay easy
to read, bundle, and debug.

## What this template includes

- Slash command registry in `src/commands/index.ts`
- Event registry in `src/events/index.ts`
- Optional MySQL pool in `src/database/`
- Shared embed helper in `src/utils/embed.ts`
- Simple config loader for `config.json`
- `.env`-only database configuration

## Project layout

- `src/index.ts` starts the bot and wires shutdown handling
- `src/config/ConfigManager.ts` loads `config.json` and `.env`
- `src/database/index.ts` builds the optional database connection from `.env`
- `src/handlers/CommandHandler.ts` loads commands and registers slash commands
- `src/handlers/EventHandler.ts` attaches event listeners
- `src/handlers/interaction/CommandInteractionHandler.ts` performs permission checks
- `src/utils/deploy-commands.ts` registers guild slash commands

## Setup

1. Install dependencies.

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in:

- `DISCORD_TOKEN`
- `CLIENT_ID`
- `GUILD_ID`

3. Update `config.json` with your project-specific values:

- `developers`
- `bot.guildId`
- `guild.roles.staff`
- `guild.roles.admin`

## Database setup

Database settings now come only from `.env`.
Nothing in `config.json` is used for database credentials or connection details.

If you want database access:

```env
DB_ENABLED=true
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=discordts_bot
DB_CONNECTION_LIMIT=10
```

If you do not need a database yet, leave `DB_ENABLED=false`.

## Commands included

- `/ping` for regular users
- `/embed` for staff/admin-style usage with Discord permission checks
- `/debug` for developers

## Permission model

This template supports two permission layers:

- Bot-level integer permissions from `config.json`
- Native Discord permissions defined directly in command files

The default config levels are:

- `0` user
- `1` staff
- `2` admin
- `3` developer

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run register
npm run generate-config
```

## Notes for extending the template

- Add new commands to `src/commands/index.ts`
- Add new events to `src/events/index.ts`
- Keep secrets in `.env`
- Keep reusable project behavior in `config.json`

The source includes extra inline comments in the runtime-critical files so this
can double as a learning template, not just a starter zip.

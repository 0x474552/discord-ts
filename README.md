# Discord Bot Template

This is a Discord.js + TypeScript starter meant to be easy to extend and scale. Noting that commands and events are registered explicitly, and boilerplate codes are included for reference on common extension points.

Feel free to fork and contribute to this repository if you think you can improve certain aspects of the files and codes that will ultimately benefit other people!

## What this template includes

- Slash command registry in `src/commands/index.ts`
- Event registry in `src/events/index.ts`
- Optional MySQL pool in `src/database/`
- Shared embed helper in `src/utils/embed.ts`
- Config-driven intents, partials, presence, and permission levels in `config.json`
- `.env`-only database configuration

## Project layout

- `src/index.ts` starts the bot and wires shutdown handling
- `src/config/ConfigManager.ts` loads `config.json` and `.env`
- `src/database/index.ts` builds the optional database connection from `.env`
- `src/handlers/CommandHandler.ts` loads commands and registers slash commands
- `src/handlers/EventHandler.ts` attaches event listeners
- `src/handlers/interaction/CommandInteractionHandler.ts` performs permission checks
- `src/utils/deploy-commands.ts` registers guild slash commands
- `scripts/build.mjs` controls exactly which files are emitted to `dist/`, this is the structure currently (by-default)
    > => `dist/utils/deploy-commands.js`<br>
    > => `dist/index.js`
- `*.boilerplate.ts` files are reference-only examples and not loaded automatically

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create your runtime config file.

```bash
npm run setup-config
```

3. Copy `.env.example` to `.env` and fill in:

- `DISCORD_TOKEN`
- `CLIENT_ID`
- **NOTE:** <br>`GUILD_ID` is optional if you prefer to keep slash-command registration tied to
`config.json`. If both exist, `.env` wins.

4. Update `config.json` with your project-specific values:

- `developers`
- `bot.guildId`
- `guild.roles.staff`
- `guild.roles.admin`
- `intents` and `partials` if your bot needs more gateway features

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
- `/embed` for staff or moderators using Discord permission checks
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
npm run setup-config
npm run dev
npm run typecheck
npm run lint
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
- Edit `scripts/build.mjs` if you want `dist/` to emit more than `index.js` and `utils/deploy-commands.js`
- Copy the `*.boilerplate.ts` files when you want examples, but do not expect them to be loaded automatically

## Issues

- If you find a bug or see a clearer way to teach a pattern, open an issue or a pull request.

The source includes extra inline comments in the runtime-critical files so this
can double as a learning template, not just a starter zip.

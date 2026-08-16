# BMKG Discord Bot

A Discord bot that provides earthquake information from **BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)** directly to your Discord server.

## Features

- Latest earthquake information
- Automatic earthquake notifications
- Configurable earthquake notification channel
- Discord slash commands
- BMKG data integration
- Modular command and event system
- Environment variable configuration

## Commands

| Command | Description |
| --- | --- |
| `/gempaterbaru` | Displays the latest earthquake information |
| `/setgempa [channel]` | Sets a channel for earthquake notifications |
| `/cuaca` | Displays weather information *(Coming Soon)* |

## Requirements

Before installing the bot, make sure you have:

- [Node.js](https://nodejs.org/) installed
- A Discord application
- A Discord bot
- A Discord server where you can manage bots

### Dependencies

- Node.js
- Discord.js `14.25.1`
- dotenv `17.3.1`

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Kylan1940/BMKG-Discord-Bot.git
cd BMKG-Discord-Bot
```

### 2. Install Dependencies

Install all required dependencies using npm:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
TOKEN=YOUR_DISCORD_BOT_TOKEN
```

Replace `YOUR_DISCORD_BOT_TOKEN` with your Discord bot token.

### 4. Create a Discord Application

Go to the [Discord Developer Portal](https://discord.com/developers/applications).

1. Click **New Application**.
2. Enter a name for your application.
3. Open the **Bot** section.
4. Click **Add Bot**.
5. Copy the bot token.
6. Put the token inside your `.env` file.

### 5. Invite the Bot

Open **OAuth2 → URL Generator** in the Discord Developer Portal.

Under **Scopes**, select:

- `bot`
- `applications.commands`

Under **Bot Permissions**, give the bot the permissions required to:

- View Channels
- Send Messages
- Embed Links
- Read Message History

Generate the URL and invite the bot to your Discord server.

### 6. Start the Bot

Run:

```bash
node src/index.js
```

If the configuration is correct, the bot will connect to Discord and become online.

## How It Works

The bot acts as a bridge between **BMKG** and **Discord**.

```text
Discord Server
      │
      ▼
  Discord.js
      │
      ▼
Command / Event Handler
      │
      ▼
   BMKG Data
      │
      ▼
Process & Format Data
      │
      ▼
Discord Embed / Notification
```

### 1. Discord Client

The application starts from `src/index.js`.

The Discord.js client is initialized and connected to Discord using the token stored in the `.env` file.

The main entry point is responsible for:

- Loading environment variables
- Creating the Discord client
- Configuring intents
- Loading event handlers
- Setting the bot presence
- Logging in to Discord

### 2. Command System

Commands are stored inside `src/commands/`.

Current commands include:

```text
src/commands/
├── gempaterbaru.js
└── setgempa.js
```

Each command is separated into its own file so that commands can be maintained independently.

### 3. Event System

Events are stored inside `src/events/`.

The current event files include:

```text
src/events/
├── ready.js
├── interactionCreate.js
└── gempaChecker.js
```

These events handle different parts of the bot's functionality.

#### `ready.js`

Handles the Discord client's `ready` event when the bot successfully connects to Discord.

#### `interactionCreate.js`

Handles Discord interactions such as slash commands.

#### `gempaChecker.js`

Handles earthquake checking and earthquake notification functionality.

### 4. Event Handler

The event handler is located at `src/handlers/eventHandler.js`.

It is responsible for loading and registering the bot's event files.

This keeps `src/index.js` from becoming unnecessarily large. Humanity has already suffered enough giant `index.js` files.

## Implementation

The project uses a modular structure to separate commands, events, and handlers.

```text
BMKG-Discord-Bot/
│
├── src/
│   ├── commands/
│   │   ├── gempaterbaru.js
│   │   └── setgempa.js
│   │
│   ├── events/
│   │   ├── gempaChecker.js
│   │   ├── interactionCreate.js
│   │   └── ready.js
│   │
│   ├── handlers/
│   │   └── eventHandler.js
│   │
│   └── index.js
│
├── .env
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
└── README.md
```

### `src/index.js`

The main entry point of the application.

It is responsible for initializing the bot and starting the application.

### `src/commands/`

Contains the bot's slash commands.

Each command has its own file. For example, `gempaterbaru.js` is responsible for the `/gempaterbaru` command.

### `src/events/`

Contains event listeners and background processes.

Events allow the bot to react to Discord activities and perform automated tasks.

### `src/handlers/`

Contains reusable handlers used by the application.

Currently, the event handler is responsible for loading the bot's event files.

## Adding a New Command

To add a new command:

1. Create a new JavaScript file inside `src/commands/`.
2. Define the slash command using Discord.js.
3. Add the command to the command registration system.
4. Restart the bot.
5. Test the command in Discord.

Example:

```text
src/
└── commands/
    ├── gempaterbaru.js
    ├── setgempa.js
    └── newcommand.js
```

This structure makes it easier to add additional functionality in the future.

## Earthquake Notifications

The bot can automatically send earthquake notifications to a configured Discord channel.

Use:

```text
/setgempa [channel]
```

to configure the channel that will receive earthquake notifications.

After the channel has been configured, the earthquake checker can monitor BMKG earthquake information and send notifications when new earthquake information is detected.

## Data Source

The earthquake information used by the bot comes from:

**BMKG — Badan Meteorologi, Klimatologi, dan Geofisika**

The bot retrieves and presents BMKG information through Discord.

The bot does not generate or verify earthquake information independently.

> **Disclaimer:** This bot is not an official BMKG application. Always refer to official BMKG information for emergency situations.

## Development

To run the bot during development:

```bash
node src/index.js
```

Make sure the `.env` file contains a valid Discord bot token.

## Roadmap

- [x] Latest earthquake command
- [x] Earthquake notification channel
- [x] Discord slash commands
- [x] Modular command system
- [x] Modular event system
- [ ] Weather command
- [ ] Additional BMKG information
- [ ] Improved notification configuration
- [ ] Better error handling
- [ ] Production deployment

## License

This project is licensed under the **Apache License 2.0**.

See the [LICENSE](LICENSE) file for more information.

## Author

**Kylan1940**

- GitHub: [Kylan1940](https://github.com/Kylan1940)
- Website: [kylan1940.netlify.app](https://kylan1940.netlify.app)

---
# NusaAlert Discord Bot

A Discord bot that provides earthquake information from **BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)** directly to your Discord server.

## Features

* Latest earthquake information from BMKG
* Automatic earthquake notifications
* Configurable earthquake notification channel
* Earthquake history storage using SQLite
* Earthquake history command
* Duplicate earthquake detection
* Discord slash commands
* BMKG data integration
* Modular command and event system
* Persistent earthquake data storage
* Environment variable configuration
* Error handling for BMKG API requests

## Commands

| Command               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `/gempaterbaru`       | Displays the latest earthquake information            |
| `/historygempa`       | Displays previously recorded earthquake information   |
| `/setgempa [channel]` | Sets a channel for automatic earthquake notifications |
| `/cuaca`              | Displays weather information *(Coming Soon)*          |

## Requirements

Before installing the bot, make sure you have:

* [Node.js](https://nodejs.org/) installed
* A Discord application
* A Discord bot
* A Discord server where you can manage bots

### Dependencies

* Node.js
* Discord.js `14.25.1`
* dotenv `17.3.1`
* better-sqlite3

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Kylan1940/NusaAlert-Discord-Bot.git
cd NusaAlert-Discord-Bot
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

> Never share or commit your Discord bot token.

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

* `bot`
* `applications.commands`

Under **Bot Permissions**, give the bot the permissions required to:

* View Channels
* Send Messages
* Embed Links
* Read Message History

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
      ├───────────────┐
      ▼               ▼
Discord Embed      SQLite
      │               │
      │               ▼
      │         Earthquake History
      │
      ▼
Discord Notification
```

### 1. Discord Client

The application starts from `src/index.js`.

The Discord.js client is initialized and connected to Discord using the token stored in the `.env` file.

The main entry point is responsible for:

* Loading environment variables
* Creating the Discord client
* Configuring intents
* Loading event handlers
* Setting the bot presence
* Logging in to Discord

### 2. Command System

Commands are stored inside `src/commands/`.

Current commands include:

```text
src/commands/

├── gempaterbaru.js
├── historygempa.js
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

Periodically checks BMKG earthquake information and handles automatic earthquake notifications.

The earthquake checker also stores newly detected earthquake data in the SQLite database.

### 4. Database System

The database system is located inside `src/database/`.

```text
src/database/

├── database.js
└── gempaRepository.js
```

NusaAlert uses SQLite to store earthquake information.

The database is automatically created at:

```text
data/nusaalert.db
```

The database is used to:

* Store detected earthquakes
* Prevent duplicate earthquake records
* Provide data for `/historygempa`
* Preserve earthquake history when the bot restarts

The database file is excluded from Git using `.gitignore`.

### Earthquake Data Flow

```text
BMKG
  │
  ▼
gempaChecker.js
  │
  ▼
gempaRepository.js
  │
  ▼
SQLite Database
  │
  ├── /historygempa
  │
  └── Future history features
```

### 5. Event Handler

The event handler is located at:

```text
src/handlers/eventHandler.js
```

It is responsible for loading and registering the bot's event files.

This keeps `src/index.js` from becoming unnecessarily large. Humanity has already suffered enough giant `index.js` files.

## Implementation

The project uses a modular structure to separate commands, events, database functionality, and handlers.

```text
NusaAlert-Discord-Bot/
│
├── src/
│   ├── commands/
│   │   ├── gempaterbaru.js
│   │   ├── historygempa.js
│   │   └── setgempa.js
│   │
│   ├── database/
│   │   ├── database.js
│   │   └── gempaRepository.js
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
├── data/
│   └── nusaalert.db
│
├── gempa-config/
│   └── ...
│
├── .env
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
└── README.md
```

> `data/nusaalert.db`, `.env`, and runtime configuration files should not be committed to Git.

### `src/index.js`

The main entry point of the application.

It is responsible for initializing the bot and starting the application.

### `src/commands/`

Contains the bot's slash commands.

Each command has its own file.

For example:

* `gempaterbaru.js` handles `/gempaterbaru`
* `historygempa.js` handles `/historygempa`
* `setgempa.js` handles `/setgempa`

### `src/database/`

Contains the SQLite database and database repository.

`database.js` initializes the SQLite database and creates the required tables.

`gempaRepository.js` provides functions for storing and retrieving earthquake information.

### `src/events/`

Contains event listeners and background processes.

Events allow the bot to react to Discord activities and perform automated tasks.

### `src/handlers/`

Contains reusable handlers used by the application.

Currently, the event handler is responsible for loading the bot's event files.

## Earthquake Notifications

NusaAlert can automatically send earthquake notifications to a configured Discord channel.

Use:

```text
/setgempa [channel]
```

to configure the channel that will receive earthquake notifications.

After the channel has been configured, the earthquake checker monitors BMKG earthquake information and sends notifications when new earthquake information is detected.

## Earthquake History

NusaAlert stores detected earthquake information in a local SQLite database.

The `/historygempa` command retrieves previously recorded earthquake information from the database.

Example:

```text
/historygempa
```

The command displays recorded earthquake information, including details such as:

* Magnitude
* Location
* Date and time
* Depth

Earthquake records are stored locally and are not uploaded to an external database.

## Data Source

The earthquake information used by the bot comes from:

**BMKG — Badan Meteorologi, Klimatologi, dan Geofisika**

The bot retrieves and presents BMKG information through Discord.

The bot does not generate or independently verify earthquake information.

> **Disclaimer:** This bot is not an official BMKG application. Always refer to official BMKG information for emergency situations.

## Development

To run the bot during development:

```bash
node src/index.js
```

Make sure the `.env` file contains a valid Discord bot token.

## Roadmap

* [x] Latest earthquake command
* [x] Earthquake notification channel
* [x] Automatic earthquake notifications
* [x] Discord slash commands
* [x] Modular command system
* [x] Modular event system
* [x] BMKG earthquake data integration
* [x] Earthquake history database
* [x] `/historygempa` command
* [x] Duplicate earthquake detection
* [x] Production deployment
* [ ] History pagination improvements
* [ ] Earthquake detail command
* [ ] Earthquake history filters
* [ ] Improved notification configuration
* [ ] Weather command
* [ ] Additional BMKG information
* [ ] Weather notifications

## License

This project is licensed under the **Apache License 2.0**.

See the [LICENSE](LICENSE) file for more information.

## Author
**Kylan1940**
* GitHub: [Kylan1940](https://github.com/Kylan1940)
* Website: [kylan1940.netlify.app](https://kylan1940.netlify.app)
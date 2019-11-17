# Winston Discord.js Transport

A Winston transport using Discord.js, written in TypeScript

## Requirements

- Node.js 10+

## Usage

```javascript
// Setup Discord.js client
const Discord = require('discord.js');
const client = new Discord.Client();
client.login("DISCORD_API_KEY");

// Find a channel to send log messages to
const discordChannel = client.channels.find("id", discordChannel)

// Create and add the transport to a logger
const DiscordTransport = require('winston-discordjs');
logger.add(new DiscordTransport({
    discordChannel: discordChannel
});
```

## Options

From the code:

```typescript
export interface DiscordTransportStreamOptions
  extends Transport.TransportStreamOptions {
  discordClient?: Client
  discordToken?: string
  discordChannel?: string | TextChannel
}
```

Ideally a `TextChannel` is passed in, from an existing `Discord.Client`.
Otherwise, the transport expects a Channel ID as a `string`

If an ID is passed in, the Transport requires a `Discord.Client`:

- If one is passed in, we will use it
- If one is not passed in, we will create one using the given `discordToken`

import Transport from "winston-transport"
import { TextChannel, Client } from "discord.js"

export interface DiscordTransportStreamOptions
  extends Transport.TransportStreamOptions {
  discordClient?: Client
  discordToken?: string
  discordChannel?: string | TextChannel
}

export class DiscordTransport extends Transport {
  discordChannel?: TextChannel
  discordClient?: Client

  constructor(opts?: DiscordTransportStreamOptions) {
    super(opts)

    if (opts) {
      const { discordClient, discordChannel, discordToken } = opts
      if (discordClient) {
        this.discordClient = discordClient
      } else {
        if (discordToken) {
          this.discordClient = new Client()
          this.discordClient.login(discordToken)
        }
      }

      if (discordChannel) {
        if (discordChannel instanceof TextChannel) {
          this.discordChannel = discordChannel
        } else if (discordClient && typeof discordChannel === "string") {
          const channel = discordClient.channels.find("id", discordChannel)

          if (channel instanceof TextChannel) {
            this.discordChannel = channel
          }
        }
      }
    }
  }

  log(info: any, callback: () => void): void {
    setImmediate(() => {
      this.emit("logged", info)
    })

    if (this.discordChannel) {
      this.discordChannel.sendMessage(info)
    }

    callback()
  }

  logv(info: any, callback: () => void): void {
    setImmediate(() => {
      this.emit("logged", info)
    })

    if (this.discordChannel) {
      this.discordChannel.sendMessage(info)
    }

    callback()
  }
}

export default DiscordTransport

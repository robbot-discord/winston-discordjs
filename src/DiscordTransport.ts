import Transport from "winston-transport"
import { TextChannel, Client, RichEmbed } from "discord.js"
import TransportStream from "winston-transport"
import { handleInfo } from "./LogHandlers"

export interface DiscordTransportStreamOptions
  extends Transport.TransportStreamOptions {
  discordClient?: Client
  discordToken?: string
  discordChannel?: string | TextChannel
}

export class DiscordTransport extends TransportStream {
  discordChannel?: TextChannel
  discordClient?: Client

  constructor(opts?: DiscordTransportStreamOptions) {
    super(opts)

    if (opts) {
      const { discordChannel, discordToken } = opts
      if (opts.discordClient) {
        this.discordClient = opts.discordClient
      } else {
        if (discordToken) {
          this.discordClient = new Client()
          this.discordClient.on("error", error => {
            this.emit("warn", error)
          })
          this.discordClient.login(discordToken)
        }
      }

      if (discordChannel) {
        if (discordChannel instanceof TextChannel) {
          this.discordChannel = discordChannel
        } else if (this.discordClient && typeof discordChannel === "string") {
          const channel = this.discordClient.channels.get(discordChannel)

          if (channel instanceof TextChannel) {
            this.discordChannel = channel
          }
        }
      }
    }
  }

  log(info: any, callback?: () => void): void {
    setImmediate(() => {
      this.emit("logged", info)
    })

    if (!this.silent && info) {
      const logMessage = handleInfo(info, this.format, this.level)

      if (this.discordChannel && logMessage) {
        const messagePromise =
          logMessage instanceof RichEmbed
            ? this.discordChannel.send(undefined, { embed: logMessage })
            : this.discordChannel.send(logMessage)

        messagePromise.catch(error => {
          this.emit("warn", error)
        })
      }
    }

    if (callback && typeof callback === "function") {
      callback()
    }
  }

  close(): void {
    if (this.discordClient) {
      this.discordClient.destroy()
    }
  }
}

export default DiscordTransport

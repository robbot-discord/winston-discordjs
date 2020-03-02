import Transport from "winston-transport"
import { TextChannel, Client } from "discord.js"
import TransportStream from "winston-transport"
import { handleInfo } from "./LogHandlers"

export interface DiscordTransportStreamOptions
  extends Transport.TransportStreamOptions {
  discordClient?: Client
  discordToken?: string
  discordChannel?: string | TextChannel
}

const deprecationMessage = `Passing in a 'string' for { discordToken } is now deprecated, due to changes in Discord.js API. Please use a different initialization method.`

export class DiscordTransport extends TransportStream {
  discordChannel?: TextChannel
  discordClient?: Client

  /**
   * @deprecated This is a new field to assist in deprecating discordChannel gracefully. Will be removed in the next major version
   */
  discordChannelId?: string

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
          this.emit("warn", deprecationMessage)
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

      if (!this.discordChannel && this.discordClient && this.discordChannelId) {
        this.emit("warn", deprecationMessage)

        this.discordClient.channels
          .fetch(this.discordChannelId)
          .then(channel => {
            if (channel instanceof TextChannel) {
              this.discordChannel = channel
            } else {
              this.emit(
                "warn",
                `DiscordTransport received unexpected type of channel. Expected <${typeof TextChannel}>, received: <${typeof channel}>`
              )
            }
          })
          .catch(error => {
            this.emit(
              "warn",
              `DiscordTransport.log failed to initialize DiscordChannel with <${this.discordChannelId}>: ${error}`
            )
          })
      }

      if (this.discordChannel && logMessage) {
        const messagePromise =
          logMessage instanceof Array
            ? this.discordChannel.send(logMessage[0], {
                embed: logMessage[1],
              })
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

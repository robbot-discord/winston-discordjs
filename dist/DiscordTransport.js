"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordTransport = void 0;
const discord_js_1 = require("discord.js");
const winston_transport_1 = __importDefault(require("winston-transport"));
const LogHandlers_1 = require("./LogHandlers");
const deprecationMessage = `Passing in a 'string' for { discordToken } is now deprecated, due to changes in Discord.js API. Please use a different initialization method.`;
class DiscordTransport extends winston_transport_1.default {
    constructor(opts) {
        super(opts);
        if (opts) {
            const { discordChannel, discordToken, intents = [] } = opts;
            if (opts.discordClient) {
                this.discordClient = opts.discordClient;
            }
            else {
                if (discordToken) {
                    this.discordClient = new discord_js_1.Client({ intents });
                    this.discordClient.on("error", (error) => {
                        this.emit("warn", error);
                    });
                    this.discordClient.login(discordToken);
                }
            }
            if (discordChannel) {
                if (discordChannel instanceof discord_js_1.TextChannel) {
                    this.discordChannel = discordChannel;
                }
                else if (this.discordClient && typeof discordChannel === "string") {
                    this.emit("warn", deprecationMessage);
                }
            }
        }
    }
    log(info, callback) {
        setImmediate(() => {
            this.emit("logged", info);
        });
        if (!this.silent && info) {
            const logMessage = LogHandlers_1.handleInfo(info, this.format, this.level);
            if (!this.discordChannel && this.discordClient && this.discordChannelId) {
                this.emit("warn", deprecationMessage);
                this.discordClient.channels
                    .fetch(this.discordChannelId)
                    .then((channel) => {
                    if (channel instanceof discord_js_1.TextChannel) {
                        this.discordChannel = channel;
                    }
                    else {
                        this.emit("warn", `DiscordTransport received unexpected type of channel. Expected <${typeof discord_js_1.TextChannel}>, received: <${typeof channel}>`);
                    }
                })
                    .catch((error) => {
                    this.emit("warn", `DiscordTransport.log failed to initialize DiscordChannel with <${this.discordChannelId}>: ${error}`);
                });
            }
            if (this.discordChannel && logMessage) {
                if (logMessage) {
                    let messagePromise;
                    if (Array.isArray(logMessage)) {
                        const content = logMessage[0];
                        const embed = logMessage[1];
                        messagePromise = this.discordChannel.send({
                            content,
                            embeds: [embed],
                        });
                    }
                    else {
                        messagePromise = this.discordChannel.send(logMessage);
                    }
                    messagePromise.catch((error) => {
                        this.emit("warn", error);
                    });
                }
            }
        }
        if (callback && typeof callback === "function") {
            callback();
        }
    }
    close() {
        if (this.discordClient) {
            this.discordClient.destroy();
        }
    }
}
exports.DiscordTransport = DiscordTransport;
exports.default = DiscordTransport;

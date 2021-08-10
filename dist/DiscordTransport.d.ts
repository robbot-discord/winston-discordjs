import * as Transport from "winston-transport";
import { TextChannel, Client, BitFieldResolvable, IntentsString } from "discord.js";
import TransportStream from "winston-transport";
export interface DiscordTransportStreamOptions extends Transport.TransportStreamOptions {
    discordClient?: Client;
    discordToken?: string;
    discordChannel?: string | TextChannel;
    intents?: BitFieldResolvable<IntentsString, number>;
}
export declare class DiscordTransport extends TransportStream {
    discordChannel?: TextChannel;
    discordClient?: Client;
    /**
     * @deprecated This is a new field to assist in deprecating discordChannel gracefully. Will be removed in the next major version
     */
    discordChannelId?: string;
    constructor(opts?: DiscordTransportStreamOptions);
    log(info: any, callback?: () => void): void;
    close(): void;
}
export default DiscordTransport;

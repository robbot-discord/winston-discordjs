import { ColorResolvable } from "discord.js";
export declare type LogLevel = "emerg" | "alert" | "crit" | "error" | "warning" | "notice" | "info" | "debug";
export declare const LogLevelToColor: Record<LogLevel, ColorResolvable>;

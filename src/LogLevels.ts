import type { ColorResolvable } from "discord.js"
import { Colors } from "discord.js"

export type LogLevel =
  | "emerg"
  | "alert"
  | "crit"
  | "error"
  | "warning"
  | "notice"
  | "info"
  | "debug"

export const LogLevelToColor: Record<LogLevel, ColorResolvable> = {
  emerg: Colors.Red,
  alert: Colors.Red,
  crit: Colors.Red,
  error: Colors.Red,
  warning: Colors.Yellow,
  notice: Colors.Blue,
  info: Colors.Blue,
  debug: Colors.Green,
}

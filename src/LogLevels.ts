import { ColorResolvable } from "discord.js"

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
  emerg: "RED",
  alert: "RED",
  crit: "RED",
  error: "RED",
  warning: "YELLOW",
  notice: "BLUE",
  info: "BLUE",
  debug: "GREEN",
}

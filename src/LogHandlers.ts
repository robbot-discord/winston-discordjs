import { TransformableInfo, Format } from "logform"
import { isPrimitive, Primitive } from "utility-types"
import { Colors, EmbedBuilder } from "discord.js"
import { LogLevel, LogLevelToColor } from "./LogLevels"

export const isTransformableInfo = (
  info: unknown
): info is TransformableInfo => {
  return Boolean(info && "level" in (info as any) && "message" in (info as any))
}

const sortFields = (fields: string[]): string[] => {
  const sortedFields = []
  const timestampIndex = fields.findIndex((value) => value === "timestamp")
  const levelIndex = fields.findIndex((value) => value === "level")
  const messageIndex = fields.findIndex((value) => value === "message")
  if (timestampIndex !== -1) {
    sortedFields.push(fields[timestampIndex])
  }
  if (levelIndex !== -1) {
    sortedFields.push(fields[levelIndex])
  }
  if (messageIndex !== -1) {
    sortedFields.push(fields[messageIndex])
  }

  for (const field of fields) {
    if (field !== "level" && field !== "message" && field !== "timestamp") {
      sortedFields.push(field)
    }
  }

  return sortedFields
}

export const handlePrimitive = (info: Primitive): string => {
  switch (typeof info) {
    case "string": {
      return info
    }
    default: {
      return String(info)
    }
  }
}

export const handleLogform = (
  info: TransformableInfo,
  level?: string
): [string, EmbedBuilder] | undefined => {
  if ((level && level === info.level) || !level) {
    const embedBuilder = new EmbedBuilder()
    let logMessageString = ""
    const color = level
      ? LogLevelToColor[level as LogLevel] ?? Colors.Default
      : Colors.Default
    embedBuilder.setColor(color)
    const fields = sortFields(Object.keys(info))

    for (const field of fields) {
      const capitalize = (str: string): string =>
        str.charAt(0).toLocaleUpperCase() + str.slice(1)

      if (info[field]) {
        const fieldsIndex = fields.indexOf(field)
        if (fieldsIndex !== 0) {
          logMessageString += ", "
        }

        const capitalizedField = capitalize(field)
        const value = info[field]

        logMessageString += `${capitalizedField}: ${value}`
        embedBuilder.addFields([
          { name: capitalizedField, value: value.toString(), inline: true },
        ])
      }
    }

    return [logMessageString, embedBuilder]
  }

  return undefined
}

export const handleObject = (
  info: Exclude<any, Primitive>,
  format?: Format,
  level?: string
): string | [string, EmbedBuilder] | undefined => {
  if (isTransformableInfo(info)) {
    if (format) {
      const formattedInfo = format.transform(info)
      if (isTransformableInfo(formattedInfo)) {
        return handleLogform(formattedInfo, level)
      } else {
        return handlePrimitive(formattedInfo)
      }
    } else {
      return handleLogform(info, level)
    }
  } else if (info instanceof Error && info.stack) {
    return info.stack
  } else if (
    typeof info?.toString === "function" &&
    info.toString !== Object.toString
  ) {
    return info.toString()
  } else {
    // this will call toJSON on the object, if it exists
    return JSON.stringify(info)
  }
}

export const handleInfo = (
  info: unknown,
  format?: Format,
  level?: string
): string | [string, EmbedBuilder] | undefined => {
  if (isPrimitive(info)) {
    return handlePrimitive(info)
  } else if (typeof info === "function") {
    return handleInfo(info(), format, level)
  } else {
    return handleObject(info, format, level)
  }
}

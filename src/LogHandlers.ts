import { TransformableInfo, Format } from "logform"
import { isPrimitive, Primitive } from "utility-types"

export const isTransformableInfo = (info: any): info is TransformableInfo => {
  return Boolean(info && "level" in info && "message" in info)
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
): string | undefined => {
  if ((level && level === info.level) || !level) {
    // const { message, level, splat, stack, ...metadata } = info

    return JSON.stringify(info)
  }

  return undefined
}

export const handleObject = (
  info: Exclude<any, Primitive>,
  format?: Format,
  level?: string
): string | undefined => {
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
  } else if (info.toString && typeof info.toString === "function") {
    return info.toString()
  } else {
    return JSON.stringify(info)
  }
}

export const handleInfo = (
  info: any,
  format?: Format,
  level?: string
): string | undefined => {
  if (isPrimitive(info)) {
    return handlePrimitive(info)
  } else if (typeof info === "function") {
    return handleInfo(info(), format, level)
  } else {
    return handleObject(info, format, level)
  }
}

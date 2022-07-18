import { LogLevelToColor } from "../LogLevels"
import { Colors } from "discord.js"

describe("LogLevels", () => {
  describe("LogLevelToColor", () => {
    it("converts levels to colors successfully", () => {
      expect(LogLevelToColor["info"]).toBe(Colors.Blue)
      expect(LogLevelToColor["warning"]).toBe(Colors.Yellow)
      expect(LogLevelToColor["error"]).toBe(Colors.Red)
    })
  })
})

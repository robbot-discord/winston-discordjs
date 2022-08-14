import {
  isTransformableInfo,
  handlePrimitive,
  handleLogform,
  handleObject,
  handleInfo,
} from "../LogHandlers"
import * as logform from "logform"
import { EmbedBuilder } from "discord.js"

describe("LogHandlers", () => {
  const transformableInfo: logform.TransformableInfo = {
    level: "info",
    message: "hello world",
  }
  const expectedTransformableInfoResult = new EmbedBuilder({
    color: 3447003,
    fields: [
      {
        name: "Level",
        value: "info",
        inline: true,
      },
      {
        name: "Message",
        value: "hello world",
        inline: true,
      },
    ],
  })

  describe("isTransformableInfo()", () => {
    it("handles undefined", () => {
      expect(isTransformableInfo(undefined)).toBe(false)
    })

    it("handles null", () => {
      expect(isTransformableInfo(null)).toBe(false)
    })

    it("handles NaN", () => {
      expect(isTransformableInfo(NaN)).toBe(false)
    })

    it("handles 0", () => {
      expect(isTransformableInfo(0)).toBe(false)
    })

    it("handles false", () => {
      expect(isTransformableInfo(false)).toBe(false)
    })

    it(`handles ""`, () => {
      expect(isTransformableInfo("")).toBe(false)
    })

    it("handles an empty object", () => {
      expect(isTransformableInfo({})).toBe(false)
    })

    it("handles partial matches", () => {
      expect(isTransformableInfo({ level: "info" })).toBe(false)
      expect(isTransformableInfo({ message: "hello world" })).toBe(false)
    })

    it("handles exact matches", () => {
      expect(
        isTransformableInfo({ level: "info", message: "hello world" })
      ).toBe(true)
    })

    it("handles matches with additional data", () => {
      expect(
        isTransformableInfo({
          level: "info",
          message: "hello world",
          format: () => {
            return
          },
          metadata: {},
        })
      ).toBe(true)
    })
  })

  describe("handlePrimitive()", () => {
    it("handles string", () => {
      expect(handlePrimitive("hello world")).toBe("hello world")
    })

    it("handles boolean", () => {
      expect(handlePrimitive(false)).toBe("false")
    })

    it("handles number", () => {
      expect(handlePrimitive(42)).toBe("42")
    })
  })

  describe("handleLogform()", () => {
    it("handles only TransformableInfo", () => {
      expect(handleLogform(transformableInfo, "info")).toStrictEqual([
        "Level: info, Message: hello world",
        expectedTransformableInfoResult,
      ])
    })

    it("handles only TransformableInfo with additional data", () => {
      const expectedValue = new EmbedBuilder({
        color: 3447003,
        fields: [
          {
            name: "Level",
            value: "info",
            inline: true,
          },
          {
            name: "Message",
            value: "hello world",
            inline: true,
          },
          { name: "Metadata", value: "[object Object]", inline: true },
          { name: "Stack", value: "some stack", inline: true },
        ],
      })

      expect(
        handleLogform(
          {
            ...transformableInfo,
            metadata: { data: "" },
            stack: "some stack",
            empty: "",
          },
          "info"
        )
      ).toStrictEqual([
        "Level: info, Message: hello world, Metadata: [object Object], Stack: some stack",
        expectedValue,
      ])
    })

    it("handles TransformableInfo with undefined level", () => {
      const expectedValue = new EmbedBuilder({
        color: 0,
        fields: [
          {
            name: "Level",
            value: "info",
            inline: true,
          },
          {
            name: "Message",
            value: "hello world",
            inline: true,
          },
        ],
      })

      expect(handleLogform(transformableInfo, undefined)).toStrictEqual([
        "Level: info, Message: hello world",
        expectedValue,
      ])
    })

    it("handles TransformableInfo with level mismatch", () => {
      expect(handleLogform(transformableInfo, "error")).toBeUndefined()
    })

    it("handles TransformableInfo with level match", () => {
      expect(handleLogform(transformableInfo, "info")).toStrictEqual([
        "Level: info, Message: hello world",
        expectedTransformableInfoResult,
      ])
    })
  })

  describe("handleObject()", () => {
    it("handles TransformableInfo", () => {
      expect(handleObject(transformableInfo, undefined, "info")).toStrictEqual([
        "Level: info, Message: hello world",
        expectedTransformableInfoResult,
      ])
    })

    it("handles TransformableInfo with format", () => {
      const expectedEmbedBuilder = new EmbedBuilder({
        color: 0,
        fields: [
          // { name: "Timestamp", value: expect.anything(), inline: true },
          {
            name: "Level",
            value: "info",
            inline: true,
          },
          {
            name: "Message",
            value: "hello world",
            inline: true,
          },
        ],
      })

      const expectedValue = [
        expect.stringContaining("hello world"),
        expectedEmbedBuilder,
      ]

      expect(
        handleObject(
          transformableInfo,
          logform.format.combine(
            logform.format.json(),
            logform.format.simple()
            // format.timestamp()
          ),
          undefined
        )
      ).toEqual(expectedValue)
    })

    it("handles Errors without stack", () => {
      const errorWithoutStack = new Error("error message")
      errorWithoutStack.stack = undefined
      expect(handleObject(errorWithoutStack)).toBe(errorWithoutStack.toString())
    })

    it("handles Errors with stack", () => {
      const errorWithStack = new Error("error message")
      errorWithStack.stack = "some stack"
      expect(handleObject(errorWithStack)).toBe(errorWithStack.stack)
    })

    it("handles objects with a toString() function", () => {
      expect(
        handleObject({
          toString: function () {
            return "Hello World!"
          },
        })
      ).toBe("Hello World!")
    })

    it("handles objects with a toJSON() function", () => {
      expect(
        handleObject({
          toString: undefined,
          toJSON: function () {
            return { hello: "world" }
          },
        })
      ).toBe(`{"hello":"world"}`)
    })

    it("handles objects with a toString() and a toJSON() function", () => {
      expect(
        handleObject({
          toString: function () {
            return "Hello World!"
          },
          toJSON: function () {
            return JSON.stringify({ hello: "world" })
          },
        })
      ).toBe("Hello World!")
    })

    it("handles objects with a toString property that is a function", () => {
      expect(handleObject({ toString: () => "hello world" })).toBe(
        "hello world"
      )
    })

    it("handles objects with a toString property that is not a function", () => {
      const testObject = { toString: "hello world" }
      expect(handleObject(testObject)).toBe(JSON.stringify(testObject))
    })
  })

  describe("handleInfo()", () => {
    it("handles function that returns strings", () => {
      expect(handleInfo(() => "hello world")).toBe("hello world")
    })

    it("handles functions that returns boolean", () => {
      expect(handleInfo(() => false)).toBe("false")
    })

    it("handles object", () => {
      const testObject = { someProperty: "someValue" }

      expect(handleInfo(testObject)).toBe(testObject.toString())
    })
  })
})

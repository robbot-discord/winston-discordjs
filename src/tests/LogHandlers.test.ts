import {
  isTransformableInfo,
  handlePrimitive,
  handleLogform,
  handleObject,
  handleInfo,
} from "../LogHandlers"
import { TransformableInfo } from "logform"

describe("LogHandlers", () => {
  const transformableInfo: TransformableInfo = {
    level: "info",
    message: "hello world",
  }

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
          format: () => {},
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
      expect(handleLogform(transformableInfo)).toBe(
        JSON.stringify(transformableInfo)
      )
    })

    it("handles only TransformableInfo with additional data", () => {
      expect(
        handleLogform(
          Object.assign(transformableInfo, {
            metadata: { data: "" },
            stack: "",
          })
        )
      ).toBe(JSON.stringify(transformableInfo))
    })

    it("handles TransformableInfo with undefined level", () => {
      expect(handleLogform(transformableInfo, undefined)).toBe(
        JSON.stringify(transformableInfo)
      )
    })

    it("handles TransformableInfo with level mismatch", () => {
      expect(handleLogform(transformableInfo, "error")).toBeUndefined()
    })

    it("handles TransformableInfo with level match", () => {
      expect(handleLogform(transformableInfo, "info")).toBe(
        JSON.stringify(transformableInfo)
      )
    })
  })

  describe("handleObject()", () => {
    it("handles TransformableInfo", () => {
      expect(handleObject(transformableInfo)).toBe(
        JSON.stringify(transformableInfo)
      )
    })

    it("handles Errors without stack", () => {
      const errorWithoutStack = new Error("error message")
      expect(handleObject(errorWithoutStack)).toBe(
        JSON.stringify(errorWithoutStack)
      )
    })

    it("handles Errors with stack", () => {
      const errorWithStack = new Error("error message")
      errorWithStack.stack = "some stack"
      expect(handleObject(errorWithStack)).toBe(errorWithStack.stack)
    })

    it("handles objects with a toString() function", () => {
      expect(
        handleObject(
          Object.assign({}, function toString() {
            return "Hello World!"
          })
        )
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
  })
})

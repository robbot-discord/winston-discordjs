import DiscordTransport, {
  DiscordTransportStreamOptions,
} from "../DiscordTransport"
import { mocked } from "ts-jest/utils"
import Discord, { TextChannel, Channel } from "discord.js"

jest.mock("discord.js")

describe("DiscordTransport", () => {
  describe("constructor", () => {
    it("handles undefined successfully", () => {
      const transport = new DiscordTransport(undefined)

      expect(transport).toBeDefined()
      expect(transport.discordChannel).toBeUndefined()
      expect(transport.discordClient).toBeUndefined()
    })

    it("handles empty options successfully", () => {
      const options: DiscordTransportStreamOptions = {}
      const transport = new DiscordTransport(options)

      expect(transport).toBeDefined()
      expect(transport.discordChannel).toBeUndefined()
      expect(transport.discordClient).toBeUndefined()
    })

    it("handles Discord API Token successfully", () => {
      const options: DiscordTransportStreamOptions = {
        discordToken: "EXAMPLE_API_TOKEN",
        discordChannel: "12345",
      }
      const { Collection, TextChannel } = jest.requireActual("discord.js")
      const expectedChannel = new TextChannel(jest.fn())
      const channelsMap = new Map<string, Channel>()
      channelsMap.set("12345", expectedChannel)
      const channels = new Collection(channelsMap)

      const mockDiscord = mocked(Discord, true)
      mockDiscord.Client.mockImplementation(() => {
        const mockClient = (jest.fn() as unknown) as Discord.Client
        mockClient.channels = channels
        mockClient.login = jest.fn()
        mockClient.on = jest.fn()
        return mockClient
      })
      mockDiscord.TextChannel = TextChannel

      const transport = new DiscordTransport(options)

      expect(transport).toBeDefined()
      expect(transport.discordChannel).toBeDefined()
      expect(transport.discordClient).toBeDefined()

      const discordClient = mocked(transport.discordClient, true)

      expect(discordClient.login).toBeCalledTimes(1)
      expect(discordClient.on).toBeCalledTimes(1)
    })
  })

  describe("log()", () => {
    const mockClient = new Discord.Client()
    const mockGuild = new Discord.Guild(mockClient, {})
    const transport = new DiscordTransport()

    it("handles (undefined, undefined) correctly", () => {
      const discordChannel = new TextChannel(mockGuild, {})
      transport.discordChannel = discordChannel

      transport.log(undefined, undefined)

      expect(discordChannel.send).not.toBeCalled()
    })

    it("handles (string, undefined) correctly", () => {
      const discordChannel = new TextChannel(mockGuild, {})
      mocked(discordChannel.sendMessage).mockImplementation(() =>
        Promise.resolve(undefined)
      )
      transport.discordChannel = discordChannel

      transport.log("log me!", undefined)

      expect(discordChannel.sendMessage).toBeCalledWith("log me!")
    })

    it("handles sendMessage() throwing an error", done => {
      const discordChannel = new TextChannel(mockGuild, {})
      const fakeError = new Error("fake error")
      mocked(discordChannel.sendMessage).mockImplementation(() =>
        Promise.reject(fakeError)
      )
      transport.discordChannel = discordChannel
      transport.on("warn", error => {
        expect(error).toBe(fakeError)
        done()
      })
      transport.log("log me!", undefined)

      expect(discordChannel.sendMessage).toBeCalledWith("log me!")
    })

    it("handles (string, () => {})) correctly", () => {
      const callback = jest.fn()
      const discordChannel = new TextChannel(mockGuild, {})
      mocked(discordChannel.sendMessage).mockImplementation(() =>
        Promise.resolve(undefined)
      )
      transport.discordChannel = discordChannel

      transport.log("log me!", callback)

      expect(discordChannel.sendMessage).toBeCalledWith("log me!")
      expect(callback).toBeCalledTimes(1)
    })
  })

  describe("close()", () => {
    const transport = new DiscordTransport()
    it("destroys discordClient if defined", () => {
      const mockClient = new Discord.Client()
      mockClient.destroy = jest.fn()

      transport.discordClient = mockClient
      transport.close()

      expect(mockClient.destroy).toBeCalledTimes(1)
    })

    it("handles undefined discordClient", () => {
      transport.discordClient = undefined
      transport.close()
      // no expect needed, lack of Errors mean success
    })
  })
})

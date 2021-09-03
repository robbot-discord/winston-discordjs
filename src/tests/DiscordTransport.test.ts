import * as DiscordTransport from "../DiscordTransport"
import { mocked } from "ts-jest/utils"
import * as Discord from "discord.js"
import { ChannelType } from "discord-api-types/payloads/v9/channel"

jest.mock("discord.js")

describe("DiscordTransport", () => {
  describe("constructor", () => {
    it("handles undefined successfully", () => {
      const transport = new DiscordTransport.DiscordTransport(undefined)

      expect(transport).toBeDefined()
      expect(transport.discordChannel).toBeUndefined()
      expect(transport.discordClient).toBeUndefined()
    })

    it("handles empty options successfully", () => {
      const options: DiscordTransport.DiscordTransportStreamOptions = {}
      const transport = new DiscordTransport.DiscordTransport(options)

      expect(transport).toBeDefined()
      expect(transport.discordChannel).toBeUndefined()
      expect(transport.discordClient).toBeUndefined()
    })

    it("handles Discord API Token successfully", () => {
      const options: DiscordTransport.DiscordTransportStreamOptions = {
        discordToken: "EXAMPLE_API_TOKEN",
        discordChannel: "12345",
      }
      // const { Collection, TextChannel } = jest.requireActual("discord.js")
      const expectedChannel = new Discord.TextChannel(undefined, undefined)

      // const channelsMap = new Map<string, Channel>()
      // channelsMap.set("12345", expectedChannel)
      const channels = new Discord.ChannelManager(undefined, undefined)
      const mockedChannels = mocked(channels, true)

      const mockDiscord = mocked(Discord, true)
      mockDiscord.Client.mockImplementation(() => {
        const mockClient = jest.fn() as unknown as Discord.Client
        mockClient.channels = channels
        mockClient.login = jest.fn()
        mockClient.on = jest.fn()
        return mockClient
      })
      // mockDiscord.TextChannel = TextChannel

      // asserts need to be in the callback, due to the async nature
      mockedChannels.fetch.mockResolvedValue(expectedChannel)
      const transport = new DiscordTransport.DiscordTransport(options)

      expect(transport).toBeDefined()
      expect(transport.discordChannel).toBeUndefined()
      expect(transport.discordClient).toBeDefined()

      const discordClient = mocked(transport.discordClient, true)

      expect(discordClient.login).toBeCalledTimes(1)
      expect(discordClient.on).toBeCalledTimes(1)
    })
  })

  describe("log()", () => {
    const mockClient = new Discord.Client({ intents: [] })
    const mockGuild = new Discord.Guild(mockClient, {
      unavailable: true,
      id: "some-mock-id",
    })
    const transport = new DiscordTransport.DiscordTransport()

    it("handles (undefined, undefined) correctly", () => {
      const discordChannel = new Discord.TextChannel(mockGuild, {
        id: "mock-channel-id",
        type: ChannelType.GuildText,
      })
      transport.discordChannel = discordChannel

      transport.log(undefined, undefined)

      expect(discordChannel.send).not.toBeCalled()
    })

    it("handles (string, undefined) correctly", () => {
      const discordChannel = new Discord.TextChannel(mockGuild, {
        id: "mock-channel-id",
        type: ChannelType.GuildText,
      })
      mocked(discordChannel.send).mockImplementation(() =>
        Promise.resolve(undefined)
      )
      transport.discordChannel = discordChannel

      transport.log("log me!", undefined)

      expect(discordChannel.send).toBeCalledWith("log me!")
    })

    it("handles send() throwing an error", (done) => {
      const discordChannel = new Discord.TextChannel(mockGuild, {
        id: "mock-channel-id",
        type: ChannelType.GuildText,
      })
      const fakeError = new Error("fake error")
      mocked(discordChannel.send).mockImplementation(() =>
        Promise.reject(fakeError)
      )
      transport.discordChannel = discordChannel
      transport.on("warn", (error) => {
        expect(error).toBe(fakeError)
        done()
      })
      transport.log("log me!", undefined)

      expect(discordChannel.send).toBeCalledWith("log me!")
    })

    it("handles (string, () => {})) correctly", () => {
      const callback = jest.fn()
      const discordChannel = new Discord.TextChannel(mockGuild, {
        id: "mock-channel-id",
        type: ChannelType.GuildText,
      })
      mocked(discordChannel.send).mockImplementation(() =>
        Promise.resolve(undefined)
      )
      transport.discordChannel = discordChannel

      transport.log("log me!", callback)

      expect(discordChannel.send).toBeCalledWith("log me!")
      expect(callback).toBeCalledTimes(1)
    })
  })

  describe("close()", () => {
    const transport = new DiscordTransport.DiscordTransport()
    it("destroys discordClient if defined", () => {
      const mockClient = new Discord.Client({ intents: [] })
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

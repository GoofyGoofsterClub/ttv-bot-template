import { Module } from "@twitch/definitions";

export default class TestCommand extends Module {

    public readonly command: string = "test";

    async run(channel: string, tags: any, message: string, self: boolean) {
        console.log("Test passed.");
    }

}
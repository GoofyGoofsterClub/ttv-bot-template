import { YapperModule } from "@twitch/definitions";

export default class TestCommand extends YapperModule {

    async run(channel: string, tags: any, message: string, self: boolean) {
        if (message.includes("test"))
            console.log("Test mentioned!");
    }

}
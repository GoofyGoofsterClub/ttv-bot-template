import { Client } from "tmi.js";
import fs from "fs";

import { PresetOutput } from "@utils/output";
import { AuthIdentity, Module, YapperModule } from "@twitch/definitions";
import { ClientInterface } from "@utils/botinterface";
import DatabaseInterface from "@db/database";
import GetRoutesResursively from "@utils/recursive";

class TwitchClient {
    private client: ClientInterface;
    private db: DatabaseInterface;
    private Output: PresetOutput = new PresetOutput("bot");
    private commands: { [command: string]: Module };
    private yappers;
    private commandPrefix: string = "!";
    private _this: any; // A fucking hack so that twitch client stops whining about not having access to this class.

    constructor(identity: AuthIdentity | null, channels: string[] | null, databaseInterface: DatabaseInterface) {
        this.db = databaseInterface
        this.client = new Client({
            identity: identity ?? {},
            channels: channels ?? []
        });
        this.yappers = [] as YapperModule[];
        this.client._this = this;
        this.commands = {};
    }

    connect() {
        this.client.connect();
    }

    async registerEvents() {
        await this.addModules();
        this.client.on('message', this.onMessage);
        this.client.on('logon', () => { this.Output.Log("Connection established."); });
    }

    async onMessage(channel: string, tags: any, message: string, self: boolean) {
        let isACommand = message.substr(0, 1) === this._this.commandPrefix;
        let args = message.substr(1).split(' ');
        let command = args.shift() ?? '';
        this._this.Output.Log(`[${channel}] ${tags['display-name']}: ${message}${isACommand ? ' [<=]'.yellow : ''}`);

        // Yapper executable

        for (let i = 0; i < this._this.yappers.length; i++)
            this._this.yappers[i](channel, tags, message, self);

        // Commands executable
        if (!isACommand) return;
        if (!(command in this._this.commands)) return;

        this._this.commands[command](channel, tags, message, self);
    }

    public async addModules() {
        this.Output.Log("Adding modules...");
        fs.readdirSync("./dist/twitch/modules").forEach((file) => {
            let module = require(`./modules/${file}`).default;
            let moduleRunner = new module(this.db);
            this.commands[moduleRunner.command] = moduleRunner.run;
            this.Output.Log(`Adding module ${module.name.cyan}...`);
        });

        this.Output.Log("Adding yappers...");
        fs.readdirSync("./dist/twitch/yapper").forEach((file) => {
            let module = require(`./yapper/${file}`).default;
            let moduleRunner = new module(this.db);
            this.yappers.push(moduleRunner.run);
            this.Output.Log(`Adding yapper ${module.name.cyan}...`);
        });
    }
}

export default TwitchClient;
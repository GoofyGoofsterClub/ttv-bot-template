import DatabaseInterface from "@db/database";

export interface AuthIdentity {
    username: string,
    password: string
}

export abstract class Module {
    public readonly abstract command: string;
    public abstract run(channel: string, tags: any, message: string, self: boolean): void;
    public db: DatabaseInterface;

    constructor(db: DatabaseInterface) {
        this.db = db;
    }

}

export abstract class YapperModule {
    public abstract run(channel: string, tags: any, message: string, self: boolean): void;
    public db: DatabaseInterface;

    constructor(db: DatabaseInterface) {
        this.db = db;
    }

}
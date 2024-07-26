import TwitchClient from "@twitch/bot";
import DatabaseInterface from "@db/database";

(async () => {
    const database: DatabaseInterface = new DatabaseInterface(process.env.MONGO_HOST as string,
        parseInt(process.env.MONGO_PORT as string),
        process.env.MONGO_DB as string,
        process.env.MONGO_USER as string,
        process.env.MONGO_PASSWORD as string);

    const botClient = new TwitchClient(null, ['mishashto'], database);
    botClient.registerEvents();
    botClient.connect();

    await database.connect();
})().catch(console.error);
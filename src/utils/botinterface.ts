import { Client } from "tmi.js";

export interface ClientInterface extends Client {
    [key: string]: any;
};
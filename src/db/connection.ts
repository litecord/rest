import "reflect-metadata";
import {createConnection} from "typeorm";
import config from "../config";
import { join } from "path";

const entityDir = join(__dirname, "entities", "*.js");

export async function connect() {
    await createConnection({
        type: config.database.driver as any,
        host: "localhost",
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        entities: [entityDir],
        logging: false,
    });
}

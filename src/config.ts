import * as deepmerge from "deepmerge";
import * as fs from "fs";
import * as path from "path";
import {argv as options} from "optimist";

const configPath = options.configPath || path.join(__dirname, "config.json");

const configFile = fs.existsSync(configPath) ? require(configPath) : {};

let config = deepmerge({
    bridge: {
        address: "ws://127.0.0.1",
        port: "8081",
        path: "/bridge",
        password: "ravioli-ravioli-give-me-the-formuoli",
    },
    database: {
        driver: "postgres",
        host: "localhost",
        port: 5432,
        username: "root",
        password: "admin",
        database: "litecord",
    },
    api: {
        gateway: "ws://127.0.0.1:8081/gw",
        port: 3000,
    },
}, configFile as {});

config = deepmerge(config, {
    bridge: {
        address: options.bridgeAddress || config.bridge.address,
        port: options.bridgePort || config.bridge.port,
        path: options.bridgePath || config.bridge.path,
        password: options.bridgePassword || config.bridge.password,
    },
    database: {
        driver: options.dbDriver || config.database.driver,
        host: options.dbHost || config.database.host,
        port: options.dbPort || config.database.port,
        username: options.dbUsername || config.database.username,
        password: options.dbPassword || config.database.password,
        database: options.dbName || config.database.database,
    },
    api: {
        gateway: options.gwURI || config.api.gateway,
        port: options.restPort || config.api.port,
    },
} as {});

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(config, undefined, 4));
}

export default config;

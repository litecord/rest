import * as deepmerge from "deepmerge";
import * as fs from "fs";
import * as path from "path";
import {argv as options} from "optimist";

const configPath = options.configPath || path.join(__dirname, "config.json");

const configFile = fs.existsSync(configPath) ? require(configPath) : {};

let config = deepmerge({
    bridge: {
        address: "127.0.0.1",
        port: "8081",
        path: "/gw",
        password: "ravioli-ravioli-give-me-the-formuoli",
    },
}, configFile as {});

config = deepmerge(config, {
    bridge: {
        address: options.bridgeAddress || config.bridge.address,
        port: options.bridgePort || config.bridge.port,
        path: options.bridgePath || config.bridge.path,
        password: options.bridgePassword || config.bridge.password,
    },
});

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(config, undefined, 4));
}

export default config;

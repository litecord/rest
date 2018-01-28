import GatewayClient from "./bridge";
import config from "./config";
import { connect } from "./db/connection";
import { DiscordExpress } from "./rest/server";

const bridgeURI: string = config.bridge.address + (config.bridge.port ? `:${config.bridge.port}` : "") + (config.bridge.path ? config.bridge.path : "");

const client = new GatewayClient(bridgeURI);
client.start();

client.on("open", async () => {
    await connect();
    const express = new DiscordExpress(client);
    express.bridge = express.bridge;
});

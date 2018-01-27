import GatewayClient from "./bridge";
import config from "./config";
import { connect } from "./db/connection";

const bridgeURI: string = config.bridge.address + (config.bridge.port ? `:${config.bridge.port}` : "") + (config.bridge.path ? config.bridge.path : "");

console.log(bridgeURI);

const client = new GatewayClient(bridgeURI);
client.start();

client.on("open", async () => {
    await connect();
});

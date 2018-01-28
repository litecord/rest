import GatewayClient from "./bridge";
import config from "./config";
import { connect } from "./db/connection";
import { DiscordExpress } from "./rest/server";
import { ActionTypes } from "./bridge/client";
import { BridgeDispatcher } from "./bridge/util/BridgeDispatcher";
import { Request } from "./bridge/util/Request";
import { logger } from "./util/index";
import { getUser, decodeToken } from "./util/hashingUtils";

const bridgeURI: string = config.bridge.address + (config.bridge.port ? `:${config.bridge.port}` : "") + (config.bridge.path ? config.bridge.path : "");

export const bridgeClient = new GatewayClient(bridgeURI);
bridgeClient.start();

bridgeClient.on("request", (request) => {
    const requestWrapped: Request = new Request(request);
    switch (request.w) {
        case ActionTypes.TOKEN_VALIDATE:
            BridgeDispatcher.emit(ActionTypes.TOKEN_VALIDATE, requestWrapped);
            break;
        default:
            break;
    }
});
bridgeClient.on("open", async () => {
    await connect();
    const express = new DiscordExpress(bridgeClient);
    express.bridge = express.bridge;
});

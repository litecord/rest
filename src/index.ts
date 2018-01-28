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

BridgeDispatcher.on(ActionTypes.TOKEN_VALIDATE, async (request) => {
    console.log(request.data);
    const [token] = request.data;
    if (typeof token !== "string") {
        logger.warn("Bad parameter passed for token validation request.");
        return;
    }
    const decodedToken = await decodeToken(token);
    if (!decodedToken) {
        await request.respond(false);
        return;
    }
    await request.respond(true);
});

bridgeClient.on("open", async () => {
    await connect();
    const express = new DiscordExpress(bridgeClient);
    express.bridge = express.bridge;
});

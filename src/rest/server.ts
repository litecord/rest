import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as fs from "fs-extra";
import * as path from "path";
import { GatewayClient } from "../bridge/client";
import { logger } from "../util/index";
import { Route, LitecordRequest, LitecordResponse, RouteHandler } from "./util/Route";
import { send } from "./util/Constants";

const ROUTE_ROOT = path.join(__dirname, "routes");

const isRoute = (route: any): route is Route => {
    return typeof route === "object"
        && typeof route.opts === "object"
        && typeof route.opts.path === "string"
        && typeof route.opts.method === "string"
        && (
            route.opts.method === "get"
            || route.opts.method === "post"
            || route.opts.method === "options"
            || route.opts.method === "patch"
            || route.opts.method === "delete"
        )
        && typeof route.handler === "function";
};

export class DiscordExpress {

    private server: express.Express;

    public constructor(public bridge: GatewayClient) {
        this.server = express();
        this.server.use(cors());
        this.server.use(bodyParser.json());
        this.server.use((req, res, next) => {
            const lReq: LitecordRequest = req as any;
            lReq.data = {
                user: undefined as any,
                authenticated: false,
            };
            const lRes: LitecordResponse = res as any;
            lRes.reject = async (code) => {
                await send(lRes, code);
            };
        });
        (async () => {
            await this.loadDirectory(path.join(ROUTE_ROOT));
            this.server.use((req, res, next) => {
                res.status(404).json({code: 0, message: "404: Not Found"});
            });
            this.server.listen(config.api.port, () => {
                logger.info(`REST is listening on port ${config.api.port}`);
            });
        })();
    }

    /**
     * Takes in route classes and parses them. They are injected directly into Express namespace.
     * @param route the route to load
     */
    private loadRoute(route: Route): void {
        if (!isRoute(route)) {
            logger.warn("Not loading an invalid route in express");
            return;
        }
        logger.debug(`[EXPRESS ROUTE] [${route.opts.method.toUpperCase()}] PATH: "${route.opts.path}"`);
        if (!route.opts.guards) {
            this.server[route.opts.method](route.opts.path, route.handler as any);
            return;
        }
        this.server[route.opts.method](route.opts.path, (req, res) => {
            let currentIndex: number = 0;
            let previous: any;
            const next: () => void = () => {
                const guard = (route.opts.guards as RouteHandler[])[currentIndex++];
                if (!guard || previous === guard) {
                    route.handler((req as any), (res as any), () => null);
                } else {
                    previous = guard;
                    guard(req as any, res as any, next);
                }
            };
            next();
        });
    }

    /**
     * Takes a **file** path and loads it, passing it to loadRoute.
     *
     * This method checks whether the file contains an array of routes or a single route.
     * @param filePath the file path
     */
    private async loadFile(filePath: string): Promise<void> {
        let rawFile: any;
        try {
            rawFile = require(filePath);
        } catch (e) {
            logger.warn(`Couldn't load route(s) from ${filePath}`);
            console.warn(e);
            return;
        }
        if (typeof rawFile === "object" && rawFile.default) {
            rawFile = rawFile.default;
        }
        if (Array.isArray(rawFile)) {
            for (let i = 0; i < rawFile.length; i++) {
                this.loadRoute(rawFile[i]);
            }
        } else {
            this.loadRoute(rawFile);
        }
    }

    /**
     * Recursively loops over a directory and loads all files in it.
     * @param directory the directory to load
     */
    private async loadDirectory(directory: string): Promise<void> {
        const contents = await fs.readdir(directory);
        const recursivePromises: Array<Promise<void>> = [];
        for (let i = 0; i < contents.length; i++) {
            const item = contents[i];
            const itemPath = path.join(directory, item);
            let isFile: boolean = false;
            try {
                const itemStats = await fs.stat(itemPath);
                isFile = itemStats.isFile();
            } catch (e) {
                logger.warn(`Couldn't load route(s) from ${itemPath}`);
                console.warn(e);
                continue;
            }
            if (!isFile) {
                recursivePromises.push(this.loadDirectory(itemPath));
                continue;
            }
            recursivePromises.push(this.loadFile(itemPath));
        }
        await Promise.all(recursivePromises);
    }

}

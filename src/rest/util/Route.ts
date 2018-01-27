import { Request, Response } from "express";
import User from "../../db/entities/User";
import Guild from "../../db/entities/Guild";

export interface RequestDataStore {
    authenticated?: boolean;
    user: User;
    guild?: Guild;
}

export interface LitecordRequest extends Request {
    data: RequestDataStore;
    body: {
        [key: string]: any;
    };
    params: any;
    query: {[key: string]: string | undefined};
}

export interface LitecordResponse extends Response {
    reject(code: number): Promise<void>;
}

export type RouteHandler = (req: LitecordRequest, res: LitecordResponse, next: () => void) => void;

export interface Route {
    opts: {
        path: string;
        method: "get" | "post" | "options" | "patch" | "delete";
        guards?: RouteHandler[];
    };
    handler: RouteHandler;
}

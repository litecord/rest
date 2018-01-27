import {EventEmitter} from "events";
import * as EventEmitter3 from "eventemitter3";
import {logger, nonce, setKeyCasingSync, flipObjectSync} from "../util";
import * as ws from "uws";
import config from "../config";

const OPCODES = {
    HELLO: 0,
    HELLO_ACK: 1,
    HEARTBEAT: 2,
    HEARTBEAT_ACK: 3,
    REQUEST: 4,
    RESPONSE: 5,
    DISPATCH: 6,
};

const OpcodeEvents = flipObjectSync(setKeyCasingSync(OPCODES, false));

export interface Payload {
    op: number;
    [key: string]: any;
}

export interface HelloPayload extends Payload {
    op: 0;
    hb_interval: number;
}

export interface HelloAckPayload extends Payload {
    op: 1;
    password: string;
}

export interface HeartbeatPayload extends Payload {
    op: 2;
}

export interface HeartbeatAckPayload extends Payload {
    op: 3;
}

export interface RequestPayload extends Payload {
    op: 4;
    w: string;
    a: any[];
    n: string;
}

export interface ResponsePayload extends Payload {
    op: 5;
    n: string;
    r: any;
}

export interface DispatchPayload extends Payload {
    op: 6;
    w: string;
    a: any[];
}

interface PendingPayload {
    payload: Payload;
    reject: (...error: any[]) => any;
    resolve: (...data: any[]) => any;
}

export declare interface GatewayClient {
    on(event: "data", listener: (payload: Payload) => void): this;
    on(event: "response", listener: (payload: ResponsePayload) => void): this;
    on(event: "heartbeat_ack", listener: (payload: HeartbeatAckPayload) => void): this;
    on(event: "hello", listener: (payload: HelloPayload) => void): this;
    on(event: "error", listener: (error: Error) => void): this;
    on(event: string, listener: (...data: any[]) => void): this;
}

export class GatewayClient extends EventEmitter {
    public readonly heartbeatInterval: number = 10000;

    private _socket?: ws;
    private _hbInterval?: NodeJS.Timer;
    private queue: PendingPayload[] = [];
    private pendingRequests: Map<string, (data: any) => any>;

    constructor(private url: string) {
        super();
        this.on("open", async () => {
            if (this.queue.length > 0) {
                for (let i = 0; i < this.queue.length; i++) {
                    const queuedPayload = this.queue[i];
                    await this.send(queuedPayload.payload, queuedPayload.resolve, queuedPayload.reject);
                    queuedPayload.resolve();
                }
                this.queue = [];
            }
            logger.info("Litebridge connection has been opened.");
        });
        this.on("close", () => logger.warn("Litebrige connection appears to have closed."));
        this.on("data", (payload) => {
            const opcodeEvent = OpcodeEvents[payload.op];
            if (!opcodeEvent) {
                logger.warn(`Unhandled op ${payload.op}`);
                return;
            }
            this.emit(opcodeEvent, payload);
        });
        this.on("response", (payload) => {
            const resolution = this.pendingRequests.get(payload.n);
            if (!resolution) {
                logger.error(`Unknown response nonce: ${payload.n}`);
                return;
            }
            resolution(payload.r);
        });
        this.on("hello", (payload) => {
            (this as any).heartbeatInterval = payload.hb_interval;
            this.send({op: 1, password: config.bridge.password});
            if (typeof this._hbInterval !== "undefined") {
                clearInterval(this._hbInterval);
            }
            this._hbInterval = setInterval(() => this.send({op: 2}), this.heartbeatInterval);
        });
        });
    }

    public send(payload: Payload, resolveOverride?: (...data: any[]) => any, rejectOverride?: (...errors: any[]) => any): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve = resolveOverride || resolve;
            reject = rejectOverride || reject;
            if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
                logger.warn("Queuing a payload as the litebridge connection is not currently open.");
                this.queue.push({payload, resolve, reject});
                return;
            }
            this.socket.send(JSON.stringify(payload), (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    public request(name: string, args: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            const requestNonce = nonce();
            const requestPayload: RequestPayload = {
                op: 4,
                w: name,
                a: args,
                n: requestNonce,
            };
            this.send(requestPayload).then(() => {
                this.pendingRequests.set(requestNonce, resolve);
            }).catch(reject);
        });
    }

    public async dispatch(name: string, args: any[] = []): Promise<void> {
        const dispatchPayload: DispatchPayload = {
            op: 6,
            w: name,
            a: args,
        };
        await this.send(dispatchPayload);
    }

    public start(): void {
        this.socket = new ws(this.url);
    }

    public get socket(): ws | undefined {
        return this._socket;
    }

    public set socket(socket: ws | undefined) {
        if (!socket) {
            return;
        }
        if (this.socket) {
            if (this.socket.readyState === this.socket.OPEN) {
                this.socket.close();
            }
        }
        socket.onmessage = (event) => {
            const {data} = event;
            if (typeof data !== "string") {
                return;
            }
            try {
                const payload = JSON.parse(data);
                if (payload.op && typeof payload.op === "number") {
                    this.emit("data", payload);
                }
            } catch (e) {
                logger.error(e);
            }
        };
        socket.onerror = (error) => this.emit("error", error);
        socket.onclose = (event) => this.emit("close", event);
        socket.onopen = () => this.emit("open");
        this._socket = socket;
    }
}

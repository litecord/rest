import { EventEmitter } from "events";
import { Request } from "./Request";

class RequestDispatcher extends EventEmitter {
    public on(action: string, handler: (request: Request) => void): this {
        super.on(action, handler);
        return this;
    }
}

export const BridgeDispatcher = new RequestDispatcher();

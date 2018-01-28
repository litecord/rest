import { RequestPayload } from "../client";
import { bridgeClient } from "../../index";

export class Request {

    private responded: boolean = false;

    public constructor(public readonly request: RequestPayload) {
    }

    public async respond(data: any): Promise<void> {
        if (this.responded) {
            throw new Error("Request already replied to.");
        }
        await bridgeClient.respond(this.request, data);
        this.responded = true;
    }

    public get nonce(): string {
        return this.request.n;
    }

    public get actionType(): string {
        return this.request.w;
    }

    public get data(): any[] {
        return this.request.a;
    }

    public get replied(): boolean {
        return this.responded;
    }
}

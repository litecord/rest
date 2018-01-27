import * as nobi from "nobi";
import User from "../db/entities/User";
import { logger } from "./index";

export interface DecodedToken {
    snowflake: string;
    timestamp: Date;
    hmac: string;
}

const decodeBase64 = (data: string) => new Buffer(data, "base64").toString("ascii");
const encodeBase64 = (data: string) => new Buffer(data).toString("base64");

export async function decodeToken(token: string): Promise<DecodedToken | null> {
    const chunks: string[] = token.split(".");
    if (chunks.length !== 3) {
        return null;
    }
    const [snowflakeBase64, timestampBase64, hmac] = chunks;
    const snowflake = decodeBase64(snowflakeBase64);
    const timestampEpoch = (decodeBase64(timestampBase64) as any) * 1;
    if (isNaN(timestampEpoch)) {
        return null;
    }
    const timestamp = new Date();
    timestamp.setTime(timestampEpoch);
    if (isNaN(timestamp.getTime())) {
        return null;
    }
    const user = await User.findOneById(snowflake);
    if (!user) {
        return null;
    }
    const signer = nobi(user.password_salt);
    let hmacData: string;
    try {
        hmacData = signer.unsign(hmac);
    } catch (e) {
        logger.warn(`Failed to decode HMAC data from token:`);
        console.warn(e);
        return null;
    }
    if (hmacData !== `${snowflakeBase64}.${timestampBase64}`) {
        return null;
    }
    return {
        snowflake,
        timestamp,
        hmac: hmacData,
    };
}

export async function createToken(user: User | string): Promise<string> {
    if (typeof user === "string") {
        const _user = await User.findOneById(user);
        if (!_user) {
            throw new Error("Unknown user.");
        }
        user = _user;
    }
    const snowflakeBase64 = encodeBase64(user.id);
    const timestampBase64 = encodeBase64(Date.now() + "");
    const signer = nobi(user.password_salt);
    const partialToken: string = `${snowflakeBase64}.${timestampBase64}`;
    const hmac: string = signer.sign(partialToken);
    return hmac;
}

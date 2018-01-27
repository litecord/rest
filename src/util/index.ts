import * as md5 from "md5";
import { randomBytes } from "crypto";

export * from "./logger";

export function nonce() {
    return md5(randomBytes(128));
}

export function keyMirrorSync(object: {[key: string]: any}): {[key: string]: string} {
    const newObject: {[key: string]: string} = {};
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        newObject[key] = key;
    }
    return newObject;
}

export async function keyMirror(object: {[key: string]: any}): Promise<{[key: string]: string}> {
    return keyMirrorSync(object);
}

export function setKeyCasingSync(object: {[key: string]: any}, uppercase: boolean): {[key: string]: any} {
    const newObject: {[key: string]: any} = {};
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        newObject[keys[i][uppercase ? "toUpperCase" : "toLowerCase"]()] = object[keys[i]];
    }
    return newObject;
}

export async function setKeyCasing(object: {[key: string]: any}, uppercase: boolean): Promise<{[key: string]: any}> {
    return setKeyCasingSync(object, uppercase);
}

export function flipObjectSync(object: {[key: string]: string | number}): {[key: string]: any} {
    const newObject: {[key: string]: string | number} = {};
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        newObject[object[keys[i]]] = keys[i];
    }
    return newObject;
}

export async function flipObject(object: {[key: string]: string | number}): Promise<{[key: string]: any}> {
    return flipObjectSync(object);
}

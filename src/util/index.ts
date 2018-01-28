import * as md5 from "md5";
import { randomBytes } from "crypto";

const _keymirror = require("keymirror");

export * from "./logger";

export function nonce() {
    return md5(randomBytes(128));
}

export function keyMirror<T>(object: T): {[K in keyof T]: K} {
    return _keymirror(object);
}

export function onlySync<T, U>(object: T, subset: U): {[K in keyof U]: any} {
    const keys = Object.keys(object);
    const filteredObject: {[key: string]: any} = {};
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (typeof (subset as any)[key] !== "undefined") {
            filteredObject[key] = (object as any)[key];
        }
    }
    return filteredObject as any;
}

export async function only<T, U>(object: T, subset: U): Promise<{[K in keyof U]: any}> {
    return onlySync(object, subset);
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

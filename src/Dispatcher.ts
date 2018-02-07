import { keyMirror } from "./util/index";
import { EventEmitter } from "events";

export const ActionTypes = keyMirror({
    CHANNEL_CREATE: null,
    GUILD_CREATE: null,
});

export const Dispatcher = new EventEmitter();

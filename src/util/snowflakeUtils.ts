import * as simpleflake from "simpleflake";

function pad(v: any, n: any, c: any = "0") {
    return String(v).length >= n ? String(v) : (String(c).repeat(n) + v).slice(-n);
}

/**
 * Generates a Discord-like snowflake. Very basic.
 *
 * @param time the time this snowflake is for
 */
export function generateSnowflake(time = Date.now()): string {
    return simpleflake(time).toString("base10");
}

export function getDate(snowflake: string): Date {
    const date = new Date();
    date.setTime(simpleflake.parse(snowflake)[0]);
    return date;
}

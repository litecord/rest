import * as deepmerge from "deepmerge";

export interface FuseData {
    data: {
        [key: string]: any;
    };
    items: Array<string | {name: string, sourceKey: string}>;
}

export async function fuse(sources: FuseData[]): Promise<any> {
    let fusedObject: {[key: string]: any} = {};
    for (let i = 0; i < sources.length; i++) {
        const {data, items} = sources[i];
        const fusedPartial: {[key: string]: any} = {};
        for (let j = 0; j < items.length; j++) {
            const item = items[j];
            let itemValue: any;
            if (typeof item === "string") {
                itemValue = data[item];
                if (itemValue) {
                    fusedPartial[item] = itemValue;
                }
                continue;
            }
            itemValue = data[item.sourceKey];
            if (itemValue) {
                fusedPartial[item.name] = itemValue;
            }
        }
        fusedObject = deepmerge(fusedObject, fusedPartial);
    }
    return fusedObject;
}

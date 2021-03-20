export abstract class Util {
    /**
     * @param obj is checked to find out whether it qualifies as an empty object.
     * @returns true if the input is an empty object
     */
    static isEmptyObject = (obj: any) => {
        if (obj === null || obj === undefined || Array.isArray(obj) || typeof obj !== 'object') {
            return true;
        }
        return Object.getOwnPropertyNames(obj).length === 0;
    }

    /**
     * @param input is checked to find out whether it qualifies as an empty string
     * @returns true if the input is an empty string
     */
    static isEmptyItem(input: any): boolean {
        return (typeof input === 'undefined' || !input || input.length < 0 || input === '');
    }

    static get(object: any, path: any, value: any): any {
        const pathArray = Array.isArray(path) ? path : path.split('.').filter((key: any) => key);
        const pathArrayFlat = pathArray.flatMap((part: any) => typeof part === 'string' ? part.split('.') : part);
        return pathArrayFlat.reduce((obj: any, key: string) => obj && obj[key], object) || value;
    }
}

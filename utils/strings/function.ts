
/**
 * Formats a JSON object to tree structure.
 * 
 * @param data the JSON to be formatted
 * @returns formatted JSON
 */
export const prettyJSON = (data: any) => {
    return JSON.stringify(data, null, 2)
}
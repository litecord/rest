import { RouteHandler } from "../util/Route";
import { CODES } from "../util/Constants";

export interface BodyField {
    name: string;
    type?: "string" | "boolean" | "number" | "object" | "array";
    optional?: boolean;
}

/**
 * Enforces type-checking on POST fields
 *
 * @param fields the fields to check for
 */
const BodyGuard: (fields: BodyField[]) => RouteHandler = (fields: BodyField[]) => (req, res, next) => {
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (!req.body[field.name]) {
            if (field.optional) {
                continue;
            }
            return res.reject(CODES.INVALID.FORM_BODY);
        }
        if (field.type) {
            if (field.type === "array" ? Array.isArray(req.body[field.name]) : typeof req.body[field.name] !== field.type) {
                return res.reject(CODES.INVALID.FORM_BODY);
            }
        }
    }
    next();
};

export default BodyGuard;

import { RouteHandler } from "../util/Route";
import { CODES } from "../util/Constants";

/**
 * Simple route guard for enforcing authorization
 */
const Authenticated: RouteHandler = (req, res, next) => {
    if (!req.data.authenticated) {
        return res.reject(CODES.UNAUTHORIZED);
    }
    next();
};

export default Authenticated;

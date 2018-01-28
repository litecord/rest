import { RouteHandler } from "../util/Route";
import { CODES } from "../util/Constants";

/**
 * Simple route guard for enforcing not being logged in
 */
const NotLoggedIn: RouteHandler = (req, res, next) => {
    if (req.data.authenticated || req.data.user) {
        return res.reject(CODES.BAD_REQUEST);
    }
    next();
};

export default NotLoggedIn;

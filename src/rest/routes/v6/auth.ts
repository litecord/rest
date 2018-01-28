import { Route } from "../../util/Route";
import NotLoggedIn from "../../guards/NotLoggedIn";
import BodyGuard from "../../guards/BodyGuard";
import User from "../../../db/entities/User";
import { CODES } from "../../util/Constants";

const BAD_AUTH_DATA = {email: ["Unknown email or password."]};

export default [{
    opts: {
        path: "/api/v6/auth/register",
        method: "post",
        guards: [NotLoggedIn, BodyGuard([
            {
                name: "email",
                type: "string",
            }, {
                name: "username",
                type: "string",
            }, {
                name: "password",
                type: "string",
        }])],
    },
    handler: async (req, res) => {
        const preexistingUser = await User.findOne({email: req.body.email});
        if (preexistingUser) {
            return res.status(400).json({email: ["Email already registered"]});
        }
        const user = new User();
        user.username = req.body.username;
        user.email = req.body.email;
        await user.newDiscriminator();
        await user.setPassword(req.body.password);
        await user.save();
        const token = await user.generateToken();
        res.json({token});
    },
}, {
    opts: {
        path: "/api/v6/auth/login",
        method: "post",
        guards: [NotLoggedIn, BodyGuard([
            {
                name: "email",
                type: "string",
            },
            {
                name: "password",
                type: "string",
            },
        ])],
    },
    handler: async (req, res) => {
        const user = await User.findOne({email: req.body.email});
        if (!user) {
            return res.status(400).json(BAD_AUTH_DATA);
        }
        if (!(await user.comparePasswords(req.body.password))) {
            return res.status(400).json(BAD_AUTH_DATA);
        }
        const token = await user.generateToken();
        return res.json({token});
    },
}] as Route[];

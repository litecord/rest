import { Route } from "../../util/Route";
import NotLoggedIn from "../../guards/NotLoggedIn";
import BodyGuard from "../../guards/BodyGuard";
import User from "../../../db/entities/User";

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
}] as Route[];

import { Route } from "../../../util/Route";
import Authenticated from "../../../guards/Authenticated";
import { only, keyMirrorSync } from "../../../../util/index";

const userReturns = keyMirrorSync({
    username: null,
    verified: null,
    mfa_enabled: null,
    id: null,
    phone: null,
    avatar: null,
    discriminator: null,
    email: null,
});

export default [{
    opts: {
        path: "/api/v6/users/@me",
        method: "get",
        guards: [Authenticated],
    },
    handler: async (req, res) => {
        const data = await only(req.data.user, userReturns);
        res.json(data);
    },
}] as Route[];

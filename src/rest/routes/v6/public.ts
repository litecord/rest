import { Route } from "../../util/Route";
import config from "../../../config";

export default [{
    opts: {
        path: "/api/v6/gateway",
        method: "get",
    },
    handler: (_, res) => {
          res.json({url: config.api.gateway});
    },
}] as Route[];

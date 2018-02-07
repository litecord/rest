import { Route } from "../../util/Route";
import Authenticated from "../../guards/Authenticated";
import BodyGuard from "../../guards/BodyGuard";
import Guild from "../../../db/entities/Guild";
import { CODES } from "../../util/Constants";
import { Dispatcher, ActionTypes } from "../../../Dispatcher";
import { ChannelTypes } from "../../../db/entities/Channel";

const isValidRegion = (region: string) => true;

export default [
    // Guild Create
    {
        opts: {
            path: "/api/v6/guilds",
            method: "post",
            guards: [Authenticated, BodyGuard([
                {
                    name: "icon",
                    type: "string",
                    optional: true,
                },
                {
                    name: "name",
                    type: "string",
                    optional: false,
                },
                {
                    name: "region",
                    type: "string",
                    optional: false,
                },
            ])],
        },
        async handler(req, res) {
            if (!isValidRegion(req.body.region)) {
                return res.reject(CODES.BAD_REQUEST);
            }
            const guild = new Guild();
            guild.name = req.body.name;
            guild.icon = req.body.icon;
            guild.region = req.body.region;
            guild.owner_id = req.data.user.id;
            try {
                await guild.save();
            } catch (e) {
                return res.reject(CODES.UNKNOWN.ERROR);
            }
            await guild.createChannel("general", ChannelTypes.GUILD_TEXT, false);
            Dispatcher.emit(ActionTypes.GUILD_CREATE, guild);
            res.json(await guild.json());
        },
    },
] as Route[];

import {Entity, Column, BaseEntity, PrimaryColumn} from "typeorm";
import { generateSnowflake } from "../../util/snowflakeUtils";
import Channel from "./Channel";
import { Dispatcher, ActionTypes } from "../../Dispatcher";

/**
 * Used as placeholder values until there is a stable API for them
 */
export const GUILD_PRESETS = (guild: Guilds) => ({
    application_id: null,
    features: [],
    widget_channel_id: null,
    embed_channel_id: null,
    emojis: [],
    embed_enabled: false,
    widget_enabled: false,
    roles: [{
        hoist: false,
        name: "@everyone",
        mentionable: false,
        color: 0,
        position: 0,
        id: guild.id,
        managed: false,
        permissions: 104324161,
    }],
    region: "us-south",
});

@Entity()
class Guilds extends BaseEntity {

    @PrimaryColumn({default: generateSnowflake()})
    public id: string = generateSnowflake();

    @Column("varchar", {length: 100, nullable: false})
    public name: string;

    @Column("text", {nullable: true})
    public icon: string;

    @Column("text", {nullable: true})
    public splash: string;

    @Column("text", {nullable: false})
    public owner_id: string;

    @Column("text", {nullable: false})
    public region: string;

    @Column("text", {nullable: true, default: null})
    public afk_channel_id: string;

    @Column("int", {default: 600, nullable: true})
    public afk_timeout: number = 600;

    @Column("int", {default: 0, nullable: true})
    public verification_level: number;

    @Column("int", {default: 0, nullable: true})
    public default_message_notifications: number;

    @Column("int", {default: 0, nullable: false})
    public explicit_content_filter: number;

    @Column("int", {default: 0, nullable: false})
    public mfa_lavel: number;

    @Column("text", {nullable: true})
    public features: string;

    public async json(): Promise<any> {
        return Object.assign(this, GUILD_PRESETS(this));
    }

    public async createChannel(name: string, type: number, dispatch: boolean = true): Promise<Channel> {
        const channel = new Channel();
        channel.channel_type = type;
        channel.guild_id = this.id;
        channel.name = name;
        await channel.save();
        if (dispatch) {
            Dispatcher.emit(ActionTypes.CHANNEL_CREATE, channel);
        }
        return channel;
    }

}

export default Guilds;

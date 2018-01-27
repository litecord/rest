import {Entity, Column, BaseEntity, PrimaryColumn} from "typeorm";
import { generateSnowflake } from "../../util/snowflakeUtils";

@Entity()
class Guilds extends BaseEntity {

    @PrimaryColumn({default: generateSnowflake()})
    public id: string = generateSnowflake();

    @Column("varchar", {length: 100})
    public name: string;

    @Column("text")
    public icon: string;

    @Column("text")
    public splash: string;

    @Column("text")
    public owner_id: string;

    @Column("text")
    public region: string;

    @Column("text")
    public afk_channel_id: string;

    @Column("int")
    public afk_timeout: number;

    @Column("int", {default: 0})
    public verification_lavel: number;

    @Column("int")
    public default_message_notifications: number;

    @Column("int", {default: 0})
    public explicit_content_filter: number;

    @Column("int", {default: 0})
    public mfa_lavel: number;

    @Column("text")
    public features: string;

}

export default Guilds;

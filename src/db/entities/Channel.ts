import { Entity, Column, PrimaryColumn } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";

export const ChannelTypes = {
    GUILD_TEXT:	0,
    DM:	1,
    GUILD_VOICE: 2,
    GROUP_DM: 3,
    GUILD_CATEGORY:	4,
};

@Entity()
class Channels extends BaseEntity {
    @PrimaryColumn("text", {nullable: false})
    public id: string;

    @Column("text", {nullable: false})
    public guild_id: string;

    @Column("int", {nullable: false})
    public channel_type: number;

    @Column("varchar", {length: 100, nullable: false})
    public name: string;

    @Column("int", {nullable: false, default: 0})
    public position: number = 0;

    @Column("varchar", {length: 1024, nullable: true})
    public topic: string;
}

export default Channels;

import * as nobi from "nobi";
import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, PrimaryColumn} from "typeorm";
import { generateSnowflake } from "../../util/snowflakeUtils";
import { nonce } from "../../util/index";

@Entity()
class Users extends BaseEntity {

    @PrimaryColumn({default: () => generateSnowflake()})
    public id: string = generateSnowflake();

    @Column("varchar", {length: 32})
    public username: string;

    @Column("varchar", {length: 4})
    public discriminator: string;

    @Column("text")
    public avatar: string;

    @Column({default: false})
    public bot: boolean;

    @Column({default: false})
    public mfa_enabled: boolean;

    @Column({default: false})
    public verified: boolean;

    @Column("varchar")
    public email: string;

    @Column("int")
    public flags: number;

    @Column("varchar", {length: 60})
    public phone: string;

    @Column("text")
    public password_hash: string;

    @Column("text")
    public password_salt: string = nobi(nonce()).sign(Date.now() + "");

}

export default Users;

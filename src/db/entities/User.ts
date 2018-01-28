import * as bcrypt from "bcrypt";
import * as nobi from "nobi";
import {Entity, Column, BaseEntity, PrimaryColumn} from "typeorm";
import { generateSnowflake } from "../../util/snowflakeUtils";
import { nonce } from "../../util/index";
import { createToken } from "../../util/hashingUtils";

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

    public async newDiscriminator(): Promise<void> {
        const rollTheDice = async (): Promise<void> => {
            const discrim = Math.floor(Math.random() * 9999) + "";
            const docs = await Users.findOne({username: this.username, discriminator: discrim});
            if (docs) {
                return rollTheDice();
            } else {
                this.discriminator = discrim;
            }
        };
        return rollTheDice();
    }

    public async setPassword(password: string): Promise<void> {
        const salt = this.password_salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        this.password_hash = hash;
        return;
    }

    public async comparePasswords(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password_hash);
    }

    public async generateToken(): Promise<string> {
        return await createToken(this);
    }

}

export default Users;

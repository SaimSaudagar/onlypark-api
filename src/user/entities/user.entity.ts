import { Entity, Column, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
import * as bcrypt from "bcrypt";
import { UserStatus, UserType } from "../../common/enums";
import { Auditable } from "../../common/decorators";
import { UserRole } from "./user-role.entity";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("users")
@Auditable()
export class User extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", unique: true, nullable: false })
  email: string;

  @Column({ type: "varchar", nullable: false })
  password: string;

  @Column({ type: "timestamp", nullable: true })
  emailVerifiedAt: Date;

  @Column({
    type: "enum",
    enum: UserType,
    nullable: false,
  })
  type: UserType;

  @Column({ type: "varchar", nullable: true })
  rememberToken: string;

  @Column({ type: "varchar", nullable: true })
  phoneNumber: string;

  @Column({ type: "varchar", nullable: true })
  image: string;

  @Column({ type: "varchar", nullable: true })
  passwordResetToken: string;

  @Column({ type: "timestamp", nullable: true })
  passwordResetExpires: Date;

  @Column({
    type: "enum",
    enum: UserStatus,
    nullable: false,
    default: UserStatus.INACTIVE,
  })
  status: UserStatus;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

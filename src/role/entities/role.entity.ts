import { Entity, Column, OneToMany } from "typeorm";
import { RolePermission } from "./role-permission.entity";
import { UserRole } from "../../user/entities/user-role.entity";
import { Auditable } from "../../common/decorators";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("roles")
@Auditable()
export class Role extends BaseEntity {
  @Column({ type: "varchar", unique: true, nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}

import { Entity, Column, OneToMany } from "typeorm";
import { RolePermission } from "../../role/entities/role-permission.entity";
import { Auditable } from "../../common/decorators";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("permissions")
@Auditable()
export class Permission extends BaseEntity {
  @Column({ type: "varchar", unique: true, nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];
}

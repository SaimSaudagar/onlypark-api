import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Role } from "./role.entity";
import { Permission } from "../../permission/entities/permission.entity";
import { Auditable } from "../../common/decorators";

@Entity("role_permissions")
@Auditable()
export class RolePermission {
  @PrimaryColumn({ type: "uuid" })
  rolesId: string;

  @PrimaryColumn({ type: "uuid" })
  permissionsId: string;

  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "rolesId" })
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "permissionsId" })
  permission: Permission;
}

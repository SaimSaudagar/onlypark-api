import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from '../../role/entities/role.entity';

@Entity('user_roles')
export class UserRole {
  @PrimaryColumn({ type: 'uuid' })
  usersId: string;

  @PrimaryColumn({ type: 'uuid' })
  rolesId: string;

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usersId' })
  user: User;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rolesId' })
  role: Role;
}

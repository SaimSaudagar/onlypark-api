import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserType } from '../../common/enums';
import { Auditable } from '../../common/decorators';
import { UserRole } from './user-role.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { CarparkManager } from '../../carpark-manager/entities/carpark-manager.entity';
import { PatrolOfficer } from '../../patrol-officer/entities/patrol-officer.entity';


@Entity('users')
@Auditable()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: false,
  })
  type: UserType;

  @Column({ type: 'varchar', nullable: true })
  rememberToken: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({ type: 'varchar', nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', nullable: false, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToOne(() => Admin, (admin) => admin.user)
  admin: Admin;

  @OneToOne(() => CarparkManager, (manager) => manager.user)
  carparkManager: CarparkManager;

  @OneToOne(() => PatrolOfficer, (officer) => officer.user)
  patrolOfficer: PatrolOfficer;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

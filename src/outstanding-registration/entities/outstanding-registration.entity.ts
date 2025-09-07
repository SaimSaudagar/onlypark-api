import {
  Entity,
  Column,
} from 'typeorm';
import { Auditable } from '../../common/decorators';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('outstanding_registrations')
@Auditable()
export class OutstandingRegistration extends BaseEntity {

  @Column({ type: 'varchar', nullable: false })
  regNo: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;
}

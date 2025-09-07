import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DisputeStatus } from '../../common/enums';
import { Auditable } from '../../common/decorators';
import { Infringement } from './infringement.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('disputes')
@Auditable()
export class Dispute extends BaseEntity {

  @Column({ type: 'varchar', nullable: false })
  carSpotId: string;

  @Column({ type: 'varchar', nullable: false })
  firstName: string;

  @Column({ type: 'varchar', nullable: false })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  companyName: string;

  @Column({ type: 'text', nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: false })
  state: string;

  @Column({ type: 'varchar', nullable: false })
  zipCode: string;

  @Column({ type: 'varchar', nullable: false })
  mobileNumber: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  carMake: string;

  @Column({ type: 'varchar', nullable: false })
  model: string;

  @Column({ type: 'varchar', nullable: false })
  regNo: string;

  @Column({ type: 'varchar', nullable: false })
  paymentNoticeNo: string;

  @Column({ type: 'text', nullable: false })
  appeal: string;

  @Column({ type: 'varchar', nullable: true })
  responseReason: string;

  @Column({ type: 'json', nullable: true })
  photos: object;

  @Column({ type: 'json', nullable: true })
  responsePhotos: object;

  @Column({
    type: 'enum',
    enum: DisputeStatus,
    default: DisputeStatus.PENDING,
  })
  status: DisputeStatus;

  @ManyToOne(() => Infringement, (infringement) => infringement.disputes)
  @JoinColumn({ name: 'ticketNumber' })
  infringement: Infringement;
}

import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    DeleteDateColumn,
} from 'typeorm';
import { DisputeStatus } from '../../common/enums';
import { Auditable } from '../../common/decorators';
import { Infringement } from '../../infringement/entities/infringement.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { CarMake } from '../../car-make/entities/car-make.entity';

@Entity('disputes')
@Auditable()
export class Dispute extends BaseEntity {
    @ManyToOne(() => Infringement)
    @JoinColumn({ name: 'infringementId' })
    infringement: Infringement;

    @Column({ type: 'varchar', nullable: false })
    infringementId: string;

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

    @ManyToOne(() => CarMake)
    @JoinColumn({ name: 'carMakeId' })
    carMake: CarMake;

    @Column({ type: 'varchar', nullable: true })
    carMakeId: string;

    @Column({ type: 'varchar', nullable: false })
    model: string;

    @Column({ type: 'varchar', nullable: false })
    registrationNumber: string;

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

}

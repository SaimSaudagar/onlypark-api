import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { VehicleRegChangeOtp } from './vehicle-reg-change-otp.entity';
import { Auditable } from '../../common/decorators';
import { Tenancy } from '../../tenancy/entities/tenancy.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('bookings')
@Auditable()
export class Booking extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    email: string;

    @Column({ type: 'varchar', nullable: false })
    vehicleReg: string;

    @Column({ type: 'varchar', nullable: true })
    tenancyId: string;

    @ManyToOne(() => Tenancy)
    @JoinColumn({ name: 'tenancyId' })
    tenancy: Tenancy;

    @Column({ type: 'varchar', nullable: false })
    subCarParkCode: string;

    @Column({ type: 'varchar', nullable: false })
    property: string;

    @Column({ type: 'varchar', nullable: false })
    startTime: string;

    @Column({ type: 'varchar', nullable: false })
    endTime: string;

    @Column({ type: 'varchar', default: 'active' })
    status: string;

    @Column({ type: 'varchar', nullable: false })
    subCarParkId: string;

    @ManyToOne(() => SubCarPark)
    @JoinColumn({ name: 'subCarParkId' })
    subCarPark: SubCarPark

    @OneToMany(() => VehicleRegChangeOtp, (otp) => otp.booking)
    vehicleRegChangeOtps: VehicleRegChangeOtp[];
}


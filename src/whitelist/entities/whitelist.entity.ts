import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { Tenancy } from '../../tenancy/entities/tenancy.entity';
import { Auditable } from '../../common/decorators';
import { BaseEntity } from '../../common/entities/base.entity';
import { WhitelistStatus, WhitelistType } from '../../common/enums';
import { VehicleRegChangeOtp } from './vehicle-reg-change-otp.entity';

@Entity('whitelist')
@Auditable()
export class Whitelist extends BaseEntity {
    @Column({ type: 'varchar', nullable: false })
    registrationNumber: string;

    @Column({ type: 'text', nullable: true })
    comments: string;

    @Column({ type: 'varchar', nullable: false })
    email: string;

    @Column({ type: 'varchar', nullable: false })
    whitelistType: WhitelistType;

    @Column({ type: 'varchar', nullable: true })
    token: string;

    @Column({ type: 'timestamp', nullable: false })
    startDate: Date;

    @Column({ type: 'timestamp', nullable: false })
    endDate: Date;

    @ManyToOne(() => SubCarPark, (subCarPark) => subCarPark.whitelists)
    @JoinColumn({ name: 'subCarParkId' })
    subCarPark: SubCarPark;

    @Column({ type: 'varchar', nullable: false })
    subCarParkId: string;

    @ManyToOne(() => Tenancy, (tenancy) => tenancy.whitelists)
    @JoinColumn({ name: 'tenancyId' })
    tenancy: Tenancy;

    @Column({ type: 'varchar', nullable: false })
    tenancyId: string;

    @OneToMany(() => VehicleRegChangeOtp, (otp) => otp.whitelist)
    vehicleRegChangeOtps: VehicleRegChangeOtp[];

    @Column({ type: 'varchar', nullable: false })
    status: WhitelistStatus;
}

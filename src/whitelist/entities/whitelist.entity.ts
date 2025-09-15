import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { Tenancy } from '../../tenancy/entities/tenancy.entity';
import { Auditable } from '../../common/decorators';
import { BaseEntity } from '../../common/entities/base.entity';
import { WhitelistType } from '../../common/enums';

@Entity('whitelist')
@Auditable()
export class Whitelist extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    vehicalRegistration: string;

    @Column({ type: 'text', nullable: true })
    comments: string;

    @Column({ type: 'varchar', nullable: false })
    email: string;

    @Column({ type: 'varchar', nullable: false })
    whitelistType: WhitelistType;

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
}

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

@Entity('whitelistcompany')
@Auditable()
export class WhitelistCompany extends BaseEntity {
    @Column({ type: 'varchar', nullable: false })
    companyName: string;

    @Column({ type: 'varchar', nullable: false })
    email: string;

    @ManyToOne(() => SubCarPark, (subCarPark) => subCarPark.whitelistCompanies)
    @JoinColumn({ name: 'subCarParkId' })
    subCarPark: SubCarPark;

    @Column({ type: 'varchar', nullable: false })
    subCarParkId: string;
}

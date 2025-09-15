import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { CarparkManager } from './carpark-manager.entity';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { Auditable } from '../../common/decorators';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('carpark_manager_whitelist_assigned_sub_car_park')
@Auditable()
export class CarparkManagerWhitelistSubCarPark extends BaseEntity {
    @ManyToOne(() => CarparkManager, (carparkManager) => carparkManager.carparkManagerWhitelistSubCarParks)
    @JoinColumn({ name: 'carparkManagerId' })
    carparkManager: CarparkManager;

    @Column({ type: 'varchar', nullable: false })
    carparkManagerId: string;

    @ManyToOne(() => SubCarPark, (subCarPark) => subCarPark.carparkManagerWhitelistSubCarParks)
    @JoinColumn({ name: 'subCarParkId' })
    subCarPark: SubCarPark;

    @Column({ type: 'varchar', nullable: false })
    subCarParkId: string;
}

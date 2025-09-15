import { Column, Entity, OneToMany } from "typeorm";
import { Auditable } from "../../common/decorators";
import { BaseEntity } from "../../common/entities/base.entity";
import { Infringement } from "./infringement.entity";

@Entity('infringement_car_park')
@Auditable()
export class InfringementCarPark extends BaseEntity {
    @Column({ type: 'varchar', nullable: false })
    carParkName: string;

    @OneToMany(() => Infringement, (infringement) => infringement.infringementCarPark)
    infringements: Infringement[];
}
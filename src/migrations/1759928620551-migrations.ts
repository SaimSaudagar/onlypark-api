import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1759928620551 implements MigrationInterface {
    name = 'Migrations1759928620551'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "visitors" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "email" character varying NOT NULL,
                "registrationNumber" character varying NOT NULL,
                "tenancyId" uuid NOT NULL,
                "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
                "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
                "status" character varying NOT NULL DEFAULT 'Active',
                "subCarParkId" uuid NOT NULL,
                "token" character varying NOT NULL,
                CONSTRAINT "UQ_5131ec25819ba3c0cb393b5218e" UNIQUE ("token"),
                CONSTRAINT "PK_d0fd6e34a516c2bb3bbec71abde" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "visitors"
            ADD CONSTRAINT "FK_d2a4890d2e76e21774a08cb42b7" FOREIGN KEY ("tenancyId") REFERENCES "tenancies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visitors"
            ADD CONSTRAINT "FK_943e019ca8ea4beba5790e6575f" FOREIGN KEY ("subCarParkId") REFERENCES "sub_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "visitors" DROP CONSTRAINT "FK_943e019ca8ea4beba5790e6575f"
        `);
        await queryRunner.query(`
            ALTER TABLE "visitors" DROP CONSTRAINT "FK_d2a4890d2e76e21774a08cb42b7"
        `);
        await queryRunner.query(`
            DROP TABLE "visitors"
        `);
    }

}

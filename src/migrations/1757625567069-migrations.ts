import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1757625567069 implements MigrationInterface {
    name = 'Migrations1757625567069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "black_list_reg" DROP CONSTRAINT "FK_02614b2b8eb01fb6a1cf1024f5b"
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist_company" DROP CONSTRAINT "FK_534b8c4654e047fb26d8a695143"
        `);
        await queryRunner.query(`
            ALTER TABLE "black_list_reg"
                RENAME COLUMN "subCarParkId" TO "masterCarParkId"
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager" DROP COLUMN "assignedCarParks"
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ADD "carparkManagerId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "black_list_reg"
            ADD CONSTRAINT "FK_210d5a273465cc16d4af63f1dd2" FOREIGN KEY ("masterCarParkId") REFERENCES "master_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ADD CONSTRAINT "FK_73afa81bc4c1407e8e79b4cd343" FOREIGN KEY ("carparkManagerId") REFERENCES "carpark_manager"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist_company"
            ADD CONSTRAINT "FK_5fa98054ac379a7f5212dd73c0b" FOREIGN KEY ("subCarParkId") REFERENCES "sub_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "whitelist_company" DROP CONSTRAINT "FK_5fa98054ac379a7f5212dd73c0b"
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park" DROP CONSTRAINT "FK_73afa81bc4c1407e8e79b4cd343"
        `);
        await queryRunner.query(`
            ALTER TABLE "black_list_reg" DROP CONSTRAINT "FK_210d5a273465cc16d4af63f1dd2"
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park" DROP COLUMN "carparkManagerId"
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager"
            ADD "assignedCarParks" json NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "black_list_reg"
                RENAME COLUMN "masterCarParkId" TO "subCarParkId"
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist_company"
            ADD CONSTRAINT "FK_534b8c4654e047fb26d8a695143" FOREIGN KEY ("subCarParkId") REFERENCES "sub_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "black_list_reg"
            ADD CONSTRAINT "FK_02614b2b8eb01fb6a1cf1024f5b" FOREIGN KEY ("subCarParkId") REFERENCES "sub_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}

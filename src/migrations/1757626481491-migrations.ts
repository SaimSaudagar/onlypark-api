import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1757626481491 implements MigrationInterface {
    name = 'Migrations1757626481491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "sub_car_park" DROP CONSTRAINT "FK_73afa81bc4c1407e8e79b4cd343"
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park" DROP COLUMN "freeHours"
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ADD "freeHours" numeric(10, 2)
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ALTER COLUMN "carparkManagerId" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ADD CONSTRAINT "FK_73afa81bc4c1407e8e79b4cd343" FOREIGN KEY ("carparkManagerId") REFERENCES "carpark_manager"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "sub_car_park" DROP CONSTRAINT "FK_73afa81bc4c1407e8e79b4cd343"
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ALTER COLUMN "carparkManagerId"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park" DROP COLUMN "freeHours"
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ADD "freeHours" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ADD CONSTRAINT "FK_73afa81bc4c1407e8e79b4cd343" FOREIGN KEY ("carparkManagerId") REFERENCES "carpark_manager"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}

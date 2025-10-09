import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1760038829405 implements MigrationInterface {
    name = 'Migrations1760038829405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ALTER COLUMN "freeHours"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ALTER COLUMN "noOfPermitsPerRegNo"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ALTER COLUMN "noOfPermitsPerRegNo"
            SET DEFAULT '1'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ALTER COLUMN "noOfPermitsPerRegNo" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ALTER COLUMN "noOfPermitsPerRegNo" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ALTER COLUMN "freeHours" DROP NOT NULL
        `);
    }

}

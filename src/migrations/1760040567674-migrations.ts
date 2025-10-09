import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1760040567674 implements MigrationInterface {
    name = 'Migrations1760040567674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "black_list"
                RENAME COLUMN "regNo" TO "registrationNumber"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "black_list"
                RENAME COLUMN "registrationNumber" TO "regNo"
        `);
    }

}

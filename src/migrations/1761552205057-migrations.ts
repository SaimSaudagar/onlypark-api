import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1761552205057 implements MigrationInterface {
    name = 'Migrations1761552205057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "outstanding_registrations"
                RENAME COLUMN "regNo" TO "registrationNumber"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "outstanding_registrations"
                RENAME COLUMN "registrationNumber" TO "regNo"
        `);
    }

}

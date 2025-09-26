import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1758852856689 implements MigrationInterface {
    name = 'Migrations1758852856689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "infringements"
                RENAME COLUMN "registrationNo" TO "registrationNumber"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
                RENAME COLUMN "registrationNo" TO "registrationNumber"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "disputes"
                RENAME COLUMN "registrationNumber" TO "registrationNo"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
                RENAME COLUMN "registrationNumber" TO "registrationNo"
        `);
    }

}

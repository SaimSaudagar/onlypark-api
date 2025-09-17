import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1758069913676 implements MigrationInterface {
    name = 'Migrations1758069913676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "whitelist"
            ADD "startDate" TIMESTAMP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist"
            ADD "endDate" TIMESTAMP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "ticketNumber" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "ticketNumber"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist" DROP COLUMN "endDate"
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist" DROP COLUMN "startDate"
        `);
    }

}

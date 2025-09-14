import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1757811108199 implements MigrationInterface {
    name = 'Migrations1757811108199'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "whitelist_company"
                RENAME COLUMN "email" TO "domainName"
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
            ALTER TABLE "whitelist_company"
                RENAME COLUMN "domainName" TO "email"
        `);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1757893180085 implements MigrationInterface {
    name = 'Migrations1757893180085'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
    }

}

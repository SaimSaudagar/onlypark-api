import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1758071229293 implements MigrationInterface {
    name = 'Migrations1758071229293'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "whitelist"
            ADD "token" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "whitelist" DROP COLUMN "token"
        `);
    }

}

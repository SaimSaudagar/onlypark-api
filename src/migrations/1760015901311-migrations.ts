import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1760015901311 implements MigrationInterface {
    name = 'Migrations1760015901311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "whitelist"
            ADD "duration" integer DEFAULT '0'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "whitelist" DROP COLUMN "duration"
        `);
    }

}

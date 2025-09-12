import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1757637743713 implements MigrationInterface {
    name = 'Migrations1757637743713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP CONSTRAINT "FK_e0acf76069b73d57e52a7b058a7"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP COLUMN "ticketNumber"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "ticketNumber" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."infringements_status_enum"
            RENAME TO "infringements_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."infringements_status_enum" AS ENUM('Pending', 'Paid', 'Disputed', 'Waived')
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "status" TYPE "public"."infringements_status_enum" USING "status"::"text"::"public"."infringements_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "status"
            SET DEFAULT 'Pending'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."infringements_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP COLUMN "infringementId"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD "infringementId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD CONSTRAINT "FK_ed5465b3d8921285e1bd5ef9e2d" FOREIGN KEY ("infringementId") REFERENCES "infringements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP CONSTRAINT "FK_ed5465b3d8921285e1bd5ef9e2d"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP COLUMN "infringementId"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD "infringementId" character varying NOT NULL
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."infringements_status_enum_old" AS ENUM('Pending', 'Paid', 'Disputed', 'Cancelled')
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "status" TYPE "public"."infringements_status_enum_old" USING "status"::"text"::"public"."infringements_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "status"
            SET DEFAULT 'Pending'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."infringements_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."infringements_status_enum_old"
            RENAME TO "infringements_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "ticketNumber"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD "ticketNumber" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD CONSTRAINT "FK_e0acf76069b73d57e52a7b058a7" FOREIGN KEY ("ticketNumber") REFERENCES "infringements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}

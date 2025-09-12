import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1757635370274 implements MigrationInterface {
    name = 'Migrations1757635370274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_33b5e4167ff9c2033dc7af492e7"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP COLUMN "ticketTime"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP COLUMN "carMakeID"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP COLUMN "amount"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP COLUMN "sevenDayEmail"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP COLUMN "fifteenDayEmail"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP COLUMN "regNo"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP COLUMN "carPark"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP COLUMN "comment"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "carParkName" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "comments" text
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "registrationNo" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "carMakeId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_2b1544c4127691b967528a27676"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_5e2a5e19a11d351474d5a55b910"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "reasonId"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "penaltyId"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD CONSTRAINT "FK_2b1544c4127691b967528a27676" FOREIGN KEY ("reasonId") REFERENCES "infringement_reason"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD CONSTRAINT "FK_5e2a5e19a11d351474d5a55b910" FOREIGN KEY ("penaltyId") REFERENCES "infringement_penalty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD CONSTRAINT "FK_5b2b5a1a772554ab26fe596add0" FOREIGN KEY ("carMakeId") REFERENCES "car_make"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_5b2b5a1a772554ab26fe596add0"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_5e2a5e19a11d351474d5a55b910"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_2b1544c4127691b967528a27676"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "penaltyId" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "reasonId" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD CONSTRAINT "FK_5e2a5e19a11d351474d5a55b910" FOREIGN KEY ("penaltyId") REFERENCES "infringement_penalty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD CONSTRAINT "FK_2b1544c4127691b967528a27676" FOREIGN KEY ("reasonId") REFERENCES "infringement_reason"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP COLUMN "carMakeId"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP COLUMN "registrationNo"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP COLUMN "comments"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP COLUMN "carParkName"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "comment" text
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "carPark" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "regNo" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "fifteenDayEmail" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "sevenDayEmail" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "amount" numeric(10, 2) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "carMakeID" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "ticketTime" TIME NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD CONSTRAINT "FK_33b5e4167ff9c2033dc7af492e7" FOREIGN KEY ("carMakeID") REFERENCES "car_make"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}

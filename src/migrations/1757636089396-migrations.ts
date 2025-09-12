import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1757636089396 implements MigrationInterface {
    name = 'Migrations1757636089396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty" DROP COLUMN "penalty"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty" DROP COLUMN "stripeProductId"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP COLUMN "carMake"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP COLUMN "regNo"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP COLUMN "paymentNoticeNo"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP COLUMN "carSpotId"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty"
            ADD "carParkName" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty"
            ADD "penaltyName" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty"
            ADD "stripePriceIdBeforeDue" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty"
            ADD "stripePriceIdAfterDue" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty"
            ADD "amountBeforeDue" numeric NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty"
            ADD "amountAfterDue" numeric NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD "infringementId" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD "carParkName" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD "carMakeId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD "registrationNo" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD "ticketNumber" SERIAL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_2b1544c4127691b967528a27676"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_5e2a5e19a11d351474d5a55b910"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_5b2b5a1a772554ab26fe596add0"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "ticketDate" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "carParkName" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "dueDate" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "reasonId" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "penaltyId" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "carMakeId" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD CONSTRAINT "FK_b11307ca42df7c64dbabb4cbf83" FOREIGN KEY ("carMakeId") REFERENCES "car_make"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "disputes" DROP CONSTRAINT "FK_b11307ca42df7c64dbabb4cbf83"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "carMakeId"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "penaltyId"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "reasonId"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "dueDate"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "carParkName"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ALTER COLUMN "ticketDate"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD CONSTRAINT "FK_5b2b5a1a772554ab26fe596add0" FOREIGN KEY ("carMakeId") REFERENCES "car_make"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "infringements" DROP COLUMN "ticketNumber"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP COLUMN "registrationNo"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP COLUMN "carMakeId"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP COLUMN "carParkName"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP COLUMN "infringementId"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty" DROP COLUMN "amountAfterDue"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty" DROP COLUMN "amountBeforeDue"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty" DROP COLUMN "stripePriceIdAfterDue"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty" DROP COLUMN "stripePriceIdBeforeDue"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty" DROP COLUMN "penaltyName"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty" DROP COLUMN "carParkName"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD "carSpotId" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD "paymentNoticeNo" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD "regNo" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD "carMake" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty"
            ADD "stripeProductId" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "infringement_penalty"
            ADD "penalty" character varying NOT NULL
        `);
    }

}

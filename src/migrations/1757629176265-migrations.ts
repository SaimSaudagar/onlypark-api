import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1757629176265 implements MigrationInterface {
    name = 'Migrations1757629176265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "carpark_manager" DROP COLUMN "managerLevel"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."carpark_manager_managerlevel_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."users_type_enum"
            RENAME TO "users_type_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_type_enum" AS ENUM('admin', 'carpark_manager', 'patrol_officer')
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "type" TYPE "public"."users_type_enum" USING "type"::"text"::"public"."users_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."users_status_enum"
            RENAME TO "users_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_status_enum" AS ENUM('Active', 'Inactive', 'Suspended')
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "status" TYPE "public"."users_status_enum" USING "status"::"text"::"public"."users_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "status"
            SET DEFAULT 'Inactive'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."carpark_manager_status_enum"
            RENAME TO "carpark_manager_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."carpark_manager_status_enum" AS ENUM('Active', 'Inactive', 'Suspended')
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager"
            ALTER COLUMN "status" TYPE "public"."carpark_manager_status_enum" USING "status"::"text"::"public"."carpark_manager_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager"
            ALTER COLUMN "status"
            SET DEFAULT 'Active'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."carpark_manager_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."disputes_status_enum"
            RENAME TO "disputes_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."disputes_status_enum" AS ENUM('Pending', 'Approved', 'Rejected')
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ALTER COLUMN "status" TYPE "public"."disputes_status_enum" USING "status"::"text"::"public"."disputes_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ALTER COLUMN "status"
            SET DEFAULT 'Pending'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."disputes_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."infringements_status_enum"
            RENAME TO "infringements_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."infringements_status_enum" AS ENUM('Pending', 'Paid', 'Disputed', 'Cancelled')
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
            ALTER TYPE "public"."admin_status_enum"
            RENAME TO "admin_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."admin_status_enum" AS ENUM('Active', 'Inactive', 'Suspended')
        `);
        await queryRunner.query(`
            ALTER TABLE "admin"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "admin"
            ALTER COLUMN "status" TYPE "public"."admin_status_enum" USING "status"::"text"::"public"."admin_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "admin"
            ALTER COLUMN "status"
            SET DEFAULT 'Active'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."admin_status_enum_old"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."admin_status_enum_old" AS ENUM('active', 'inactive', 'suspended')
        `);
        await queryRunner.query(`
            ALTER TABLE "admin"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "admin"
            ALTER COLUMN "status" TYPE "public"."admin_status_enum_old" USING "status"::"text"::"public"."admin_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "admin"
            ALTER COLUMN "status"
            SET DEFAULT 'active'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."admin_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."admin_status_enum_old"
            RENAME TO "admin_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."infringements_status_enum_old" AS ENUM('pending', 'paid', 'disputed', 'cancelled')
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
            SET DEFAULT 'pending'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."infringements_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."infringements_status_enum_old"
            RENAME TO "infringements_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."disputes_status_enum_old" AS ENUM('pending', 'approved', 'rejected')
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ALTER COLUMN "status" TYPE "public"."disputes_status_enum_old" USING "status"::"text"::"public"."disputes_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ALTER COLUMN "status"
            SET DEFAULT 'pending'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."disputes_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."disputes_status_enum_old"
            RENAME TO "disputes_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."carpark_manager_status_enum_old" AS ENUM('active', 'inactive', 'suspended')
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager"
            ALTER COLUMN "status" TYPE "public"."carpark_manager_status_enum_old" USING "status"::"text"::"public"."carpark_manager_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager"
            ALTER COLUMN "status"
            SET DEFAULT 'active'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."carpark_manager_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."carpark_manager_status_enum_old"
            RENAME TO "carpark_manager_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_status_enum_old" AS ENUM('active', 'inactive', 'suspended')
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "status" TYPE "public"."users_status_enum_old" USING "status"::"text"::"public"."users_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "status"
            SET DEFAULT 'inactive'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."users_status_enum_old"
            RENAME TO "users_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_type_enum_old" AS ENUM('ADMIN', 'CARPARK_MANAGER', 'PATROL_OFFICER')
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "type" TYPE "public"."users_type_enum_old" USING "type"::"text"::"public"."users_type_enum_old"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_type_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."users_type_enum_old"
            RENAME TO "users_type_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."carpark_manager_managerlevel_enum" AS ENUM('senior', 'junior', 'trainee')
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager"
            ADD "managerLevel" "public"."carpark_manager_managerlevel_enum" NOT NULL DEFAULT 'senior'
        `);
    }

}

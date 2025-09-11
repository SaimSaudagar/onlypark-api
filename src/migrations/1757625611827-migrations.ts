import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1757625611827 implements MigrationInterface {
    name = 'Migrations1757625611827'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "black_list_reg" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "regNo" character varying NOT NULL,
                "email" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'active',
                "comments" character varying,
                "masterCarParkId" uuid NOT NULL,
                CONSTRAINT "PK_a2b2ead5e27ec105ee5f06e8313" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."master_car_park_carparktype_enum" AS ENUM('Retail', 'Residential')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."master_car_park_status_enum" AS ENUM('Active', 'Disabled')
        `);
        await queryRunner.query(`
            CREATE TABLE "master_car_park" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "carParkName" character varying NOT NULL,
                "carParkType" "public"."master_car_park_carparktype_enum" NOT NULL,
                "masterCarParkCode" character varying NOT NULL,
                "status" "public"."master_car_park_status_enum" NOT NULL DEFAULT 'Active',
                CONSTRAINT "UQ_0ef43240eac7a88aacc9fd9e0ef" UNIQUE ("masterCarParkCode"),
                CONSTRAINT "PK_c53bb0428c1651cd7d690b5b27e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "vehicle_reg_change_otps" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "email" character varying NOT NULL,
                "oldReg" character varying NOT NULL,
                "newReg" character varying NOT NULL,
                "otp" character varying NOT NULL,
                "status" boolean NOT NULL DEFAULT false,
                "expiresAt" TIMESTAMP NOT NULL,
                "bookingId" uuid,
                CONSTRAINT "PK_c024306edae7e8b04500dbe52d9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "whitelist" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "vehicalRegistration" character varying NOT NULL,
                "comments" text,
                "email" character varying NOT NULL,
                "subCarParkId" uuid NOT NULL,
                "tenancyId" uuid NOT NULL,
                CONSTRAINT "PK_0169bfbd49b0511243f7a068cec" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "tenancies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "tenantName" text NOT NULL,
                "tenantEmail" text NOT NULL,
                "subCarParkId" uuid NOT NULL,
                CONSTRAINT "PK_1bc09e717213c5806a4d855c38a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "bookings" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "email" character varying NOT NULL,
                "vehicleReg" character varying NOT NULL,
                "tenancyId" uuid,
                "subCarParkCode" character varying NOT NULL,
                "property" character varying NOT NULL,
                "startTime" character varying NOT NULL,
                "endTime" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'active',
                "subCarParkId" uuid NOT NULL,
                CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "name" character varying NOT NULL,
                "description" character varying,
                CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"),
                CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "role_permissions" (
                "rolesId" uuid NOT NULL,
                "permissionsId" uuid NOT NULL,
                CONSTRAINT "PK_7931614007a93423204b4b73240" PRIMARY KEY ("rolesId", "permissionsId")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "name" character varying NOT NULL,
                "description" character varying,
                CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"),
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "usersId" uuid NOT NULL,
                "rolesId" uuid NOT NULL,
                CONSTRAINT "PK_38ffcfb865fc628fa337d9a0d4f" PRIMARY KEY ("usersId", "rolesId")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_type_enum" AS ENUM('ADMIN', 'CARPARK_MANAGER', 'PATROL_OFFICER')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'suspended')
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "emailVerifiedAt" TIMESTAMP,
                "type" "public"."users_type_enum" NOT NULL,
                "rememberToken" character varying,
                "phoneNumber" character varying,
                "image" character varying,
                "passwordResetToken" character varying,
                "passwordResetExpires" TIMESTAMP,
                "status" "public"."users_status_enum" NOT NULL DEFAULT 'inactive',
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "patrol_officer" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "officerName" character varying NOT NULL,
                "image" character varying,
                "status" character varying NOT NULL DEFAULT 'active',
                "userId" uuid NOT NULL,
                "subCarParksId" uuid,
                CONSTRAINT "REL_74afad8adf286702e5e73f6b98" UNIQUE ("userId"),
                CONSTRAINT "PK_75b9a459436f19aecea1b481b44" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."carpark_manager_managerlevel_enum" AS ENUM('senior', 'junior', 'trainee')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."carpark_manager_status_enum" AS ENUM('active', 'inactive', 'suspended')
        `);
        await queryRunner.query(`
            CREATE TABLE "carpark_manager" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "managerCode" character varying NOT NULL,
                "region" character varying,
                "contactNumber" character varying,
                "emergencyContact" character varying,
                "managerLevel" "public"."carpark_manager_managerlevel_enum" NOT NULL DEFAULT 'senior',
                "canManagePatrolOfficers" boolean NOT NULL DEFAULT true,
                "canGenerateReports" boolean NOT NULL DEFAULT true,
                "canManageTenancies" boolean NOT NULL DEFAULT true,
                "lastLoginAt" TIMESTAMP,
                "loginCount" integer NOT NULL DEFAULT '0',
                "status" "public"."carpark_manager_status_enum" NOT NULL DEFAULT 'active',
                "userId" uuid,
                CONSTRAINT "UQ_26f8c95d7844037a7799f38b225" UNIQUE ("managerCode"),
                CONSTRAINT "REL_3bb5b79e3aa960a37de422f2f8" UNIQUE ("userId"),
                CONSTRAINT "PK_aaef20b8ffe08bd5b1d520b74e9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."sub_car_park_status_enum" AS ENUM('Active', 'Disabled')
        `);
        await queryRunner.query(`
            CREATE TABLE "sub_car_park" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "carParkName" character varying NOT NULL,
                "carSpace" integer NOT NULL,
                "location" character varying NOT NULL,
                "lat" numeric(10, 8) NOT NULL,
                "lang" numeric(11, 8) NOT NULL,
                "description" text,
                "subCarParkCode" character varying NOT NULL,
                "freeHours" integer,
                "noOfPermitsPerRegNo" integer,
                "tenantEmailCheck" boolean NOT NULL DEFAULT false,
                "geolocation" boolean NOT NULL DEFAULT false,
                "event" boolean NOT NULL DEFAULT false,
                "eventDate" TIMESTAMP,
                "eventExpiryDate" TIMESTAMP,
                "status" "public"."sub_car_park_status_enum" NOT NULL DEFAULT 'Active',
                "masterCarParkId" uuid NOT NULL,
                "carparkManagerId" uuid NOT NULL,
                CONSTRAINT "UQ_4587c51261deab65d55834ba3dd" UNIQUE ("subCarParkCode"),
                CONSTRAINT "PK_381a7bfb60a409000107881f84b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "whitelist_company" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "companyName" character varying NOT NULL,
                "email" character varying NOT NULL,
                "subCarParkId" uuid NOT NULL,
                CONSTRAINT "PK_0a7068f50d6b2295d8a0a2e918a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "outstanding_registrations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "regNo" character varying NOT NULL,
                "email" character varying NOT NULL,
                CONSTRAINT "PK_41ea788144c7f1d17323cede7bd" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "infringement_reason" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "reason" character varying NOT NULL,
                CONSTRAINT "PK_c9d9e5e9de49848e06b3f157277" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "infringement_penalty" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "penalty" character varying NOT NULL,
                "stripeProductId" character varying,
                CONSTRAINT "PK_1ab6d1bb5e5b1ce2b2204bb3373" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."disputes_status_enum" AS ENUM('pending', 'approved', 'rejected')
        `);
        await queryRunner.query(`
            CREATE TABLE "disputes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "carSpotId" character varying NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "companyName" character varying,
                "address" text NOT NULL,
                "state" character varying NOT NULL,
                "zipCode" character varying NOT NULL,
                "mobileNumber" character varying NOT NULL,
                "email" character varying NOT NULL,
                "carMake" character varying NOT NULL,
                "model" character varying NOT NULL,
                "regNo" character varying NOT NULL,
                "paymentNoticeNo" character varying NOT NULL,
                "appeal" text NOT NULL,
                "responseReason" character varying,
                "photos" json,
                "responsePhotos" json,
                "status" "public"."disputes_status_enum" NOT NULL DEFAULT 'pending',
                "ticketNumber" uuid,
                CONSTRAINT "PK_3c97580d01c1a4b0b345c42a107" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "car_make" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "carMakeName" character varying NOT NULL,
                CONSTRAINT "UQ_e62e68230f264c59486630339d6" UNIQUE ("carMakeName"),
                CONSTRAINT "PK_cbde9642093e4051e40d9d352a2" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."infringements_status_enum" AS ENUM('pending', 'paid', 'disputed', 'cancelled')
        `);
        await queryRunner.query(`
            CREATE TABLE "infringements" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "ticketDate" date NOT NULL,
                "ticketTime" TIME NOT NULL,
                "carPark" character varying NOT NULL,
                "comment" text,
                "regNo" character varying NOT NULL,
                "carMakeID" uuid NOT NULL,
                "status" "public"."infringements_status_enum" NOT NULL DEFAULT 'pending',
                "photos" json,
                "amount" numeric(10, 2) NOT NULL,
                "dueDate" date NOT NULL,
                "sevenDayEmail" boolean NOT NULL DEFAULT false,
                "fifteenDayEmail" boolean NOT NULL DEFAULT false,
                "reasonId" uuid,
                "penaltyId" uuid,
                CONSTRAINT "PK_17d7ed648f5173f967afa8935d9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."admin_status_enum" AS ENUM('active', 'inactive', 'suspended')
        `);
        await queryRunner.query(`
            CREATE TABLE "admin" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "lastLoginAt" TIMESTAMP,
                "loginCount" integer NOT NULL DEFAULT '0',
                "status" "public"."admin_status_enum" NOT NULL DEFAULT 'active',
                "userId" uuid,
                CONSTRAINT "REL_f8a889c4362d78f056960ca6da" UNIQUE ("userId"),
                CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('INSERT', 'UPDATE', 'DELETE')
        `);
        await queryRunner.query(`
            CREATE TABLE "audit_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "entityName" character varying NOT NULL,
                "entityId" character varying NOT NULL,
                "action" "public"."audit_logs_action_enum" NOT NULL,
                "oldValue" json,
                "newValue" json,
                "userId" character varying,
                CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "black_list_reg"
            ADD CONSTRAINT "FK_210d5a273465cc16d4af63f1dd2" FOREIGN KEY ("masterCarParkId") REFERENCES "master_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "vehicle_reg_change_otps"
            ADD CONSTRAINT "FK_2708c5483a9d9c37a61c17c20cf" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist"
            ADD CONSTRAINT "FK_6bff1cb2b238cab33d02750dc64" FOREIGN KEY ("subCarParkId") REFERENCES "sub_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist"
            ADD CONSTRAINT "FK_453632bbe549789b1826d07c8d8" FOREIGN KEY ("tenancyId") REFERENCES "tenancies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "tenancies"
            ADD CONSTRAINT "FK_013659c17e82394b7d58d363f08" FOREIGN KEY ("subCarParkId") REFERENCES "sub_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "FK_a034db2ffba657a7f40e84a3b82" FOREIGN KEY ("tenancyId") REFERENCES "tenancies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "FK_a210c5705f874756829037e3b2e" FOREIGN KEY ("subCarParkId") REFERENCES "sub_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "FK_d422dabc78ff74a8dab6583da02" FOREIGN KEY ("permissionsId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_99b019339f52c63ae6153587380" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_13380e7efec83468d73fc37938e" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_officer"
            ADD CONSTRAINT "FK_74afad8adf286702e5e73f6b988" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_officer"
            ADD CONSTRAINT "FK_2c9a6f1305838292431a723bc2c" FOREIGN KEY ("subCarParksId") REFERENCES "sub_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager"
            ADD CONSTRAINT "FK_3bb5b79e3aa960a37de422f2f89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ADD CONSTRAINT "FK_6a241df3b955561b4fe166f451d" FOREIGN KEY ("masterCarParkId") REFERENCES "master_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ADD CONSTRAINT "FK_73afa81bc4c1407e8e79b4cd343" FOREIGN KEY ("carparkManagerId") REFERENCES "carpark_manager"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist_company"
            ADD CONSTRAINT "FK_5fa98054ac379a7f5212dd73c0b" FOREIGN KEY ("subCarParkId") REFERENCES "sub_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD CONSTRAINT "FK_e0acf76069b73d57e52a7b058a7" FOREIGN KEY ("ticketNumber") REFERENCES "infringements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ADD CONSTRAINT "FK_33b5e4167ff9c2033dc7af492e7" FOREIGN KEY ("carMakeID") REFERENCES "car_make"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "admin"
            ADD CONSTRAINT "FK_f8a889c4362d78f056960ca6dad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "admin" DROP CONSTRAINT "FK_f8a889c4362d78f056960ca6dad"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_33b5e4167ff9c2033dc7af492e7"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_5e2a5e19a11d351474d5a55b910"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_2b1544c4127691b967528a27676"
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes" DROP CONSTRAINT "FK_e0acf76069b73d57e52a7b058a7"
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist_company" DROP CONSTRAINT "FK_5fa98054ac379a7f5212dd73c0b"
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park" DROP CONSTRAINT "FK_73afa81bc4c1407e8e79b4cd343"
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park" DROP CONSTRAINT "FK_6a241df3b955561b4fe166f451d"
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager" DROP CONSTRAINT "FK_3bb5b79e3aa960a37de422f2f89"
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_officer" DROP CONSTRAINT "FK_2c9a6f1305838292431a723bc2c"
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_officer" DROP CONSTRAINT "FK_74afad8adf286702e5e73f6b988"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_13380e7efec83468d73fc37938e"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_99b019339f52c63ae6153587380"
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_d422dabc78ff74a8dab6583da02"
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c"
        `);
        await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "FK_a210c5705f874756829037e3b2e"
        `);
        await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "FK_a034db2ffba657a7f40e84a3b82"
        `);
        await queryRunner.query(`
            ALTER TABLE "tenancies" DROP CONSTRAINT "FK_013659c17e82394b7d58d363f08"
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist" DROP CONSTRAINT "FK_453632bbe549789b1826d07c8d8"
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist" DROP CONSTRAINT "FK_6bff1cb2b238cab33d02750dc64"
        `);
        await queryRunner.query(`
            ALTER TABLE "vehicle_reg_change_otps" DROP CONSTRAINT "FK_2708c5483a9d9c37a61c17c20cf"
        `);
        await queryRunner.query(`
            ALTER TABLE "black_list_reg" DROP CONSTRAINT "FK_210d5a273465cc16d4af63f1dd2"
        `);
        await queryRunner.query(`
            DROP TABLE "audit_logs"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."audit_logs_action_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "admin"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."admin_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "infringements"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."infringements_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "car_make"
        `);
        await queryRunner.query(`
            DROP TABLE "disputes"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."disputes_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "infringement_penalty"
        `);
        await queryRunner.query(`
            DROP TABLE "infringement_reason"
        `);
        await queryRunner.query(`
            DROP TABLE "outstanding_registrations"
        `);
        await queryRunner.query(`
            DROP TABLE "whitelist_company"
        `);
        await queryRunner.query(`
            DROP TABLE "sub_car_park"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."sub_car_park_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "carpark_manager"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."carpark_manager_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."carpark_manager_managerlevel_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "patrol_officer"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_type_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "user_roles"
        `);
        await queryRunner.query(`
            DROP TABLE "roles"
        `);
        await queryRunner.query(`
            DROP TABLE "role_permissions"
        `);
        await queryRunner.query(`
            DROP TABLE "permissions"
        `);
        await queryRunner.query(`
            DROP TABLE "bookings"
        `);
        await queryRunner.query(`
            DROP TABLE "tenancies"
        `);
        await queryRunner.query(`
            DROP TABLE "whitelist"
        `);
        await queryRunner.query(`
            DROP TABLE "vehicle_reg_change_otps"
        `);
        await queryRunner.query(`
            DROP TABLE "master_car_park"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."master_car_park_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."master_car_park_carparktype_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "black_list_reg"
        `);
    }

}

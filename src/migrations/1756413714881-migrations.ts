import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1756413714881 implements MigrationInterface {
    name = 'Migrations1756413714881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."master_car_park_carparktype_enum" AS ENUM('Retail', 'Residential')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."master_car_park_status_enum" AS ENUM('Active', 'Disabled')
        `);
        await queryRunner.query(`
            CREATE TABLE "master_car_park" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "carParkName" character varying NOT NULL,
                "totalCarSpace" integer NOT NULL,
                "carParkType" "public"."master_car_park_carparktype_enum" NOT NULL,
                "location" character varying NOT NULL,
                "lat" numeric(10, 8) NOT NULL,
                "lang" numeric(11, 8) NOT NULL,
                "description" text NOT NULL,
                "carParkCode" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "operatingHours" integer NOT NULL,
                "tenantEmailCheck" boolean NOT NULL DEFAULT false,
                "geolocation" boolean NOT NULL DEFAULT false,
                "event" boolean NOT NULL DEFAULT false,
                "eventDate" TIMESTAMP,
                "eventExpiryDate" TIMESTAMP,
                "status" "public"."master_car_park_status_enum" NOT NULL DEFAULT 'Active',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_3d57c134fc7e88269ec825103ef" UNIQUE ("carParkCode"),
                CONSTRAINT "UQ_778faa69db7d0356d18fb1deed7" UNIQUE ("slug"),
                CONSTRAINT "PK_c53bb0428c1651cd7d690b5b27e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "vehicle_reg_change_otps" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "oldReg" character varying NOT NULL,
                "newReg" character varying NOT NULL,
                "otp" character varying NOT NULL,
                "status" boolean NOT NULL DEFAULT false,
                "expiresAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "bookingId" uuid,
                CONSTRAINT "PK_c024306edae7e8b04500dbe52d9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "bookings" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "vehicleReg" character varying NOT NULL,
                "subCarParkCode" character varying NOT NULL,
                "property" character varying NOT NULL,
                "startTime" character varying NOT NULL,
                "endTime" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'active',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "tenancies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "tenantName" text NOT NULL,
                "tenantEmail" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "subCarParkId" uuid,
                CONSTRAINT "PK_1bc09e717213c5806a4d855c38a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "black_list_reg" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "regNo" character varying NOT NULL,
                "email" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'active',
                "comments" character varying,
                "subCarParkCode" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_a2b2ead5e27ec105ee5f06e8313" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
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
                "name" character varying NOT NULL,
                "description" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
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
            CREATE TYPE "public"."admin_accesslevel_enum" AS ENUM('full', 'limited', 'read_only')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."admin_status_enum" AS ENUM('active', 'inactive', 'suspended')
        `);
        await queryRunner.query(`
            CREATE TABLE "admin" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "adminCode" character varying NOT NULL,
                "department" character varying,
                "accessLevel" "public"."admin_accesslevel_enum" NOT NULL DEFAULT 'full',
                "canManageUsers" boolean NOT NULL DEFAULT true,
                "canManageRoles" boolean NOT NULL DEFAULT true,
                "canManageSystem" boolean NOT NULL DEFAULT true,
                "lastLoginAt" TIMESTAMP,
                "loginCount" integer NOT NULL DEFAULT '0',
                "status" "public"."admin_status_enum" NOT NULL DEFAULT 'active',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "UQ_fa33e00151e0ac0242e079b5db2" UNIQUE ("adminCode"),
                CONSTRAINT "REL_f8a889c4362d78f056960ca6da" UNIQUE ("userId"),
                CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id")
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
                "managerCode" character varying NOT NULL,
                "assignedCarParks" json NOT NULL,
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
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "UQ_26f8c95d7844037a7799f38b225" UNIQUE ("managerCode"),
                CONSTRAINT "REL_3bb5b79e3aa960a37de422f2f8" UNIQUE ("userId"),
                CONSTRAINT "PK_aaef20b8ffe08bd5b1d520b74e9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_type_enum" AS ENUM(
                'admin',
                'carparkManager',
                'subAdmin',
                'officer',
                'user'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "emailVerifiedAt" TIMESTAMP,
                "type" "public"."users_type_enum" NOT NULL,
                "rememberToken" character varying,
                "phone" character varying,
                "address" character varying,
                "city" character varying,
                "state" character varying,
                "zipCode" character varying,
                "status" character varying NOT NULL DEFAULT 'active',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "patrol_officer" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "officerName" character varying NOT NULL,
                "phoneNumber" character varying NOT NULL,
                "email" character varying NOT NULL,
                "startHour" character varying NOT NULL,
                "endHour" character varying NOT NULL,
                "image" character varying,
                "status" character varying NOT NULL DEFAULT 'active',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "subCarParkId" uuid,
                CONSTRAINT "REL_74afad8adf286702e5e73f6b98" UNIQUE ("userId"),
                CONSTRAINT "PK_75b9a459436f19aecea1b481b44" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "infringement_reason" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "reason" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_c9d9e5e9de49848e06b3f157277" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "infringement_penalty" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "penalty" character varying NOT NULL,
                "stripeProductId" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_1ab6d1bb5e5b1ce2b2204bb3373" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."disputes_status_enum" AS ENUM('pending', 'approved', 'rejected')
        `);
        await queryRunner.query(`
            CREATE TABLE "disputes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
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
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "ticketNumber" integer,
                CONSTRAINT "PK_3c97580d01c1a4b0b345c42a107" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "car_make" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_906716db045c27f467d1b68d7b7" UNIQUE ("name"),
                CONSTRAINT "PK_cbde9642093e4051e40d9d352a2" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."infringements_status_enum" AS ENUM('pending', 'paid', 'disputed', 'cancelled')
        `);
        await queryRunner.query(`
            CREATE TABLE "infringements" (
                "ticketNumber" SERIAL NOT NULL,
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
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "reasonId" uuid,
                "penaltyId" uuid,
                CONSTRAINT "PK_72a032e0c0160a5fba1e345289a" PRIMARY KEY ("ticketNumber")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."sub_car_park_spottype_enum" AS ENUM(
                'regular',
                'disabled',
                'electric',
                'compact',
                'motorcycle'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."sub_car_park_status_enum" AS ENUM('Active', 'Disabled')
        `);
        await queryRunner.query(`
            CREATE TABLE "sub_car_park" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "carParkName" character varying NOT NULL,
                "carSpace" integer NOT NULL,
                "location" character varying NOT NULL,
                "lat" numeric(10, 8) NOT NULL,
                "lang" numeric(11, 8) NOT NULL,
                "description" text NOT NULL,
                "carParkCode" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "hours" integer NOT NULL,
                "tenantEmailCheck" boolean NOT NULL DEFAULT false,
                "geolocation" boolean NOT NULL DEFAULT false,
                "event" boolean NOT NULL DEFAULT false,
                "eventDate" TIMESTAMP,
                "eventExpiryDate" TIMESTAMP,
                "spotType" "public"."sub_car_park_spottype_enum" NOT NULL,
                "status" "public"."sub_car_park_status_enum" NOT NULL DEFAULT 'Active',
                "masterCarParkId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_00e8321308cc5d4d82a10212727" UNIQUE ("carParkCode"),
                CONSTRAINT "UQ_0f49aca4014dc6543d5e43c42ac" UNIQUE ("slug"),
                CONSTRAINT "PK_381a7bfb60a409000107881f84b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "whitelist" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "vehicalRegistration" character varying NOT NULL,
                "comments" text,
                "email" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "subCarParkId" uuid,
                "tenancyId" uuid,
                CONSTRAINT "PK_0169bfbd49b0511243f7a068cec" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "outstanding_registrations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "regNo" character varying NOT NULL,
                "email" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_41ea788144c7f1d17323cede7bd" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('INSERT', 'UPDATE', 'DELETE')
        `);
        await queryRunner.query(`
            CREATE TABLE "audit_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "entityName" character varying NOT NULL,
                "entityId" character varying NOT NULL,
                "action" "public"."audit_logs_action_enum" NOT NULL,
                "oldValue" json,
                "newValue" json,
                "userId" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "vehicle_reg_change_otps"
            ADD CONSTRAINT "FK_2708c5483a9d9c37a61c17c20cf" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "FK_6c3adf98ab1ec34633ddba57964" FOREIGN KEY ("subCarParkCode") REFERENCES "sub_car_park"("carParkCode") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "tenancies"
            ADD CONSTRAINT "FK_013659c17e82394b7d58d363f08" FOREIGN KEY ("subCarParkId") REFERENCES "sub_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "black_list_reg"
            ADD CONSTRAINT "FK_24fd225f90fbb1c819766b6d9a4" FOREIGN KEY ("subCarParkCode") REFERENCES "sub_car_park"("carParkCode") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "admin"
            ADD CONSTRAINT "FK_f8a889c4362d78f056960ca6dad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager"
            ADD CONSTRAINT "FK_3bb5b79e3aa960a37de422f2f89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_officer"
            ADD CONSTRAINT "FK_74afad8adf286702e5e73f6b988" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_officer"
            ADD CONSTRAINT "FK_68ecbdb31256c6570a1415b1655" FOREIGN KEY ("subCarParkId") REFERENCES "sub_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "disputes"
            ADD CONSTRAINT "FK_e0acf76069b73d57e52a7b058a7" FOREIGN KEY ("ticketNumber") REFERENCES "infringements"("ticketNumber") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ADD CONSTRAINT "FK_96902bae9b00d0042cc161670fd" FOREIGN KEY ("carPark") REFERENCES "sub_car_park"("carParkCode") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements"
            ADD CONSTRAINT "FK_33b5e4167ff9c2033dc7af492e7" FOREIGN KEY ("carMakeID") REFERENCES "car_make"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park"
            ADD CONSTRAINT "FK_6a241df3b955561b4fe166f451d" FOREIGN KEY ("masterCarParkId") REFERENCES "master_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist"
            ADD CONSTRAINT "FK_6bff1cb2b238cab33d02750dc64" FOREIGN KEY ("subCarParkId") REFERENCES "sub_car_park"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist"
            ADD CONSTRAINT "FK_453632bbe549789b1826d07c8d8" FOREIGN KEY ("tenancyId") REFERENCES "tenancies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "whitelist" DROP CONSTRAINT "FK_453632bbe549789b1826d07c8d8"
        `);
        await queryRunner.query(`
            ALTER TABLE "whitelist" DROP CONSTRAINT "FK_6bff1cb2b238cab33d02750dc64"
        `);
        await queryRunner.query(`
            ALTER TABLE "sub_car_park" DROP CONSTRAINT "FK_6a241df3b955561b4fe166f451d"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_33b5e4167ff9c2033dc7af492e7"
        `);
        await queryRunner.query(`
            ALTER TABLE "infringements" DROP CONSTRAINT "FK_96902bae9b00d0042cc161670fd"
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
            ALTER TABLE "patrol_officer" DROP CONSTRAINT "FK_68ecbdb31256c6570a1415b1655"
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_officer" DROP CONSTRAINT "FK_74afad8adf286702e5e73f6b988"
        `);
        await queryRunner.query(`
            ALTER TABLE "carpark_manager" DROP CONSTRAINT "FK_3bb5b79e3aa960a37de422f2f89"
        `);
        await queryRunner.query(`
            ALTER TABLE "admin" DROP CONSTRAINT "FK_f8a889c4362d78f056960ca6dad"
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
            ALTER TABLE "black_list_reg" DROP CONSTRAINT "FK_24fd225f90fbb1c819766b6d9a4"
        `);
        await queryRunner.query(`
            ALTER TABLE "tenancies" DROP CONSTRAINT "FK_013659c17e82394b7d58d363f08"
        `);
        await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "FK_6c3adf98ab1ec34633ddba57964"
        `);
        await queryRunner.query(`
            ALTER TABLE "vehicle_reg_change_otps" DROP CONSTRAINT "FK_2708c5483a9d9c37a61c17c20cf"
        `);
        await queryRunner.query(`
            DROP TABLE "audit_logs"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."audit_logs_action_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "outstanding_registrations"
        `);
        await queryRunner.query(`
            DROP TABLE "whitelist"
        `);
        await queryRunner.query(`
            DROP TABLE "sub_car_park"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."sub_car_park_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."sub_car_park_spottype_enum"
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
            DROP TABLE "patrol_officer"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_type_enum"
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
            DROP TABLE "admin"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."admin_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."admin_accesslevel_enum"
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
            DROP TABLE "black_list_reg"
        `);
        await queryRunner.query(`
            DROP TABLE "tenancies"
        `);
        await queryRunner.query(`
            DROP TABLE "bookings"
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
    }

}

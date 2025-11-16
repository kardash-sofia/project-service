import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProjectAddBid1763314634487 implements MigrationInterface {
  name = 'UpdateProjectAddBid1763314634487';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."bid_status_enum" AS ENUM('pending', 'accepted', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "bid" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectId" uuid NOT NULL, "freelancerId" uuid NOT NULL, "amount" numeric NOT NULL, "comment" text, "status" "public"."bid_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "isCompleted"`);
    await queryRunner.query(
      `CREATE TYPE "public"."projects_status_enum" AS ENUM('open', 'in_progress', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "status" "public"."projects_status_enum" NOT NULL DEFAULT 'open'`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50"`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "ownerId"`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "ownerId" uuid NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "ownerId"`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "ownerId" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50"`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "isCompleted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`DROP TABLE "bid"`);
    await queryRunner.query(`DROP TYPE "public"."bid_status_enum"`);
  }
}

import { NestFactory } from "@nestjs/core";
import { SeederModule } from "./seeder.module";
import { ScanStaySeederService } from "./scan-stay/scan-stay-seeder.service";

const runScanStaySeed = async () => {
  const app = await NestFactory.create(SeederModule);

  try {
    console.log("Starting scan and stay data seeding...");
    await app.get(ScanStaySeederService).run();
    console.log("Scan and stay data seeding completed successfully!");
  } catch (error) {
    console.error("Error during scan and stay data seeding:", error);
    process.exit(1);
  } finally {
    await app.close();
  }
};

runScanStaySeed();

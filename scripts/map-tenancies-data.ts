/**
 * Script to map old dashboard tenancies SQL data to new database JSON format
 * This script reads the tenancies SQL data and creates tenancies.json
 * with proper sub car park code mapping
 */

import * as fs from "fs";
import * as path from "path";

interface OldTenancy {
  id: number;
  car_park_id: string | null;
  tenant_name: string | null;
  tenant_email: string | null;
  created_at: string;
  updated_at: string | null;
}

interface OldParkSpot {
  id: number;
  car_park_code: string;
  car_park_name: string | null;
  spot_type: string | null;
}

interface Tenancy {
  tenantName: string;
  tenantEmail: string;
  subCarParkCode: string;
  oldDashboardId?: number;
  oldDashboardCarParkId?: string;
}

// Parse SQL INSERT statements
function parseSqlInserts(
  sqlContent: string,
  tableName: string
): OldTenancy[] | OldParkSpot[] {
  const records: any[] = [];

  // Find all INSERT INTO statements for the specified table
  const insertRegex = new RegExp(
    `INSERT INTO \`${tableName}\`[^(]*\\(([^)]+)\\)\\s+VALUES\\s+([\\s\\S]*?);`,
    "gi"
  );
  const matches = sqlContent.matchAll(insertRegex);

  for (const match of matches) {
    const columns = match[1]
      .split(",")
      .map((col) => col.trim().replace(/`/g, ""));
    const valuesSection = match[2];

    // Parse individual value rows
    const valueRowRegex = /\(([^)]+(?:\([^)]*\)[^)]*)*)\)/g;
    const valueMatches = valuesSection.matchAll(valueRowRegex);

    for (const valueMatch of valueMatches) {
      const values = parseValueRow(valueMatch[1]);

      if (values.length === columns.length) {
        const record: any = {};
        columns.forEach((col, idx) => {
          record[col] = values[idx];
        });
        records.push(record);
      }
    }
  }

  return records;
}

// Parse a single value row, handling quoted strings and NULLs
function parseValueRow(valueString: string): (string | null)[] {
  const values: (string | null)[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < valueString.length) {
    const char = valueString[i];

    if (char === "'" && (i === 0 || valueString[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
      i++;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(parseValue(current.trim()));
      current = "";
      i++;
      continue;
    }

    current += char;
    i++;
  }

  // Push the last value
  if (current.trim()) {
    values.push(parseValue(current.trim()));
  }

  return values;
}

function parseValue(value: string): string | null {
  if (value === "NULL" || value === "") {
    return null;
  }

  // Remove surrounding quotes
  if (value.startsWith("'") && value.endsWith("'")) {
    return value
      .slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\r/g, "\r")
      .replace(/\\n/g, "\n");
  }

  return value;
}

// Map tenancies to new format
function mapTenancies(
  oldTenancies: OldTenancy[],
  parkSpotMap: Map<string, string>
): Tenancy[] {
  const tenancies: Tenancy[] = [];
  let skippedCount = 0;

  for (const record of oldTenancies) {
    // Skip if missing required fields
    if (!record.tenant_name || !record.tenant_email || !record.car_park_id) {
      skippedCount++;
      continue;
    }

    // Find the sub car park code from the park_spot mapping
    const subCarParkCode = parkSpotMap.get(record.car_park_id);

    if (!subCarParkCode) {
      console.warn(
        `⚠️  Warning: car_park_id ${record.car_park_id} not found in park_spot data for tenancy ${record.id}`
      );
      skippedCount++;
      continue;
    }

    const tenancy: Tenancy = {
      tenantName: record.tenant_name,
      tenantEmail: record.tenant_email,
      subCarParkCode: subCarParkCode,
      oldDashboardId: record.id,
      oldDashboardCarParkId: record.car_park_id,
    };

    tenancies.push(tenancy);
  }

  if (skippedCount > 0) {
    console.log(
      `\nℹ️  Skipped ${skippedCount} tenancies due to missing data or invalid car park references`
    );
  }

  return tenancies;
}

// Main execution
async function main() {
  try {
    console.log("Starting Tenancies SQL to JSON mapping...\n");

    // Read tenancies SQL file
    const tenanciesSqlPath = "C:\\Users\\Cyam\\Downloads\\tenancies.sql";
    console.log(`Reading tenancies SQL file from: ${tenanciesSqlPath}`);

    if (!fs.existsSync(tenanciesSqlPath)) {
      throw new Error(`Tenancies SQL file not found at: ${tenanciesSqlPath}`);
    }

    const tenanciesSqlContent = fs.readFileSync(tenanciesSqlPath, "utf-8");
    console.log("Tenancies SQL file read successfully");

    // Read park_spot SQL file for mapping
    const parkSpotSqlPath = "C:\\Users\\Cyam\\Downloads\\park_spot.sql";
    console.log(`Reading park_spot SQL file from: ${parkSpotSqlPath}`);

    if (!fs.existsSync(parkSpotSqlPath)) {
      throw new Error(`Park spot SQL file not found at: ${parkSpotSqlPath}`);
    }

    const parkSpotSqlContent = fs.readFileSync(parkSpotSqlPath, "utf-8");
    console.log("Park spot SQL file read successfully\n");

    // Parse SQL data
    console.log("Parsing tenancies SQL INSERT statements...");
    const oldTenancies = parseSqlInserts(
      tenanciesSqlContent,
      "tenancies"
    ) as OldTenancy[];
    console.log(`Parsed ${oldTenancies.length} tenancy records from SQL`);

    console.log("Parsing park_spot SQL INSERT statements...");
    const parkSpots = parseSqlInserts(
      parkSpotSqlContent,
      "park_spot"
    ) as OldParkSpot[];
    console.log(`Parsed ${parkSpots.length} park spot records from SQL\n`);

    // Create mapping from car_park_id to car_park_code (only for child spots)
    console.log("Creating car park ID to code mapping...");
    const parkSpotMap = new Map<string, string>();
    let childSpotsCount = 0;

    for (const spot of parkSpots) {
      // Only map child spots since tenancies belong to sub car parks
      if (spot.spot_type === "child") {
        parkSpotMap.set(spot.id.toString(), spot.car_park_code);
        childSpotsCount++;
      }
    }
    console.log(
      `Created mapping for ${childSpotsCount} child car parks (sub car parks)\n`
    );

    // Map to new format
    console.log("Mapping tenancies to new format...");
    const tenancies = mapTenancies(oldTenancies, parkSpotMap);
    console.log(`Successfully mapped ${tenancies.length} tenancies\n`);

    // Write JSON files
    const assetsDir = path.join(__dirname, "..", "assets", "seeding-data");

    // Backup existing file if it exists
    const tenanciesPath = path.join(assetsDir, "tenancies.json");

    if (fs.existsSync(tenanciesPath)) {
      const backupPath = path.join(assetsDir, "tenancies.backup.json");
      fs.copyFileSync(tenanciesPath, backupPath);
      console.log(`Backed up existing tenancies.json to tenancies.backup.json`);
    }

    // Write new file
    fs.writeFileSync(
      tenanciesPath,
      JSON.stringify(tenancies, null, 2),
      "utf-8"
    );
    console.log(`✓ Written ${tenancies.length} tenancies to tenancies.json`);

    // Write original data for reference
    const oldTenanciesPath = path.join(
      assetsDir,
      "old-dashboard-tenancies.json"
    );
    fs.writeFileSync(
      oldTenanciesPath,
      JSON.stringify(oldTenancies, null, 2),
      "utf-8"
    );
    console.log(
      `✓ Written ${oldTenancies.length} original tenancy records to old-dashboard-tenancies.json`
    );

    console.log("\n✅ Mapping completed successfully!");
    console.log("\nSummary:");
    console.log(`- Total tenancy records processed: ${oldTenancies.length}`);
    console.log(`- Tenancies successfully mapped: ${tenancies.length}`);
    console.log(
      `- Tenancies skipped: ${oldTenancies.length - tenancies.length}`
    );
    console.log(`- Sub car parks available for mapping: ${childSpotsCount}`);
  } catch (error) {
    console.error("❌ Error during mapping:", error);
    process.exit(1);
  }
}

main();

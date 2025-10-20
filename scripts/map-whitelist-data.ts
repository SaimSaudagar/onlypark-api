/**
 * Script to map old dashboard whitelist SQL data to new database JSON format
 * This script reads the whitelist SQL data and creates whitelist.json
 * with proper sub car park and tenancy mapping
 */

import * as fs from "fs";
import * as path from "path";

interface OldWhitelist {
  id: number;
  car_park_id: string | null;
  tenancy: string | null;
  vehical_registration: string | null;
  comments: string | null;
  duration: string | null;
  hours: string | null;
  start_date: string | null;
  end_date: string | null;
  email: string | null;
  created_at: string;
  user_id: string | null;
  ref: string | null;
  updated_at: string | null;
}

interface OldParkSpot {
  id: number;
  car_park_code: string;
  car_park_name: string | null;
  spot_type: string | null;
}

interface OldTenancy {
  id: number;
  car_park_id: string | null;
  tenant_name: string | null;
  tenant_email: string | null;
}

interface Whitelist {
  registrationNumber: string;
  comments: string | null;
  email: string;
  whitelistType: string;
  token: string | null;
  duration: number;
  startDate: string;
  endDate: string;
  subCarParkCode: string;
  tenancyId: string | null;
  status: string;
  oldDashboardId?: number;
  oldDashboardCarParkId?: string;
  oldDashboardTenancyId?: string;
}

// Parse SQL INSERT statements
function parseSqlInserts(sqlContent: string, tableName: string): any[] {
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

// Map whitelist type from old system to new
function mapWhitelistType(duration: string | null): string {
  if (!duration) return "Permanent";

  const durationLower = duration.toLowerCase();

  if (durationLower === "permanent") return "Permanent";
  if (durationLower === "hour" || durationLower === "hours") return "Hour";
  if (durationLower === "date") return "Date";
  if (durationLower === "self serve" || durationLower === "self_serve")
    return "Self Serve";

  return "Permanent"; // Default
}

// Parse date or return default
function parseDate(dateStr: string | null, isEndDate: boolean = false): string {
  if (!dateStr) {
    const now = new Date();
    if (isEndDate) {
      // For permanent whitelist, set end date to 100 years from now
      now.setFullYear(now.getFullYear() + 100);
    }
    return now.toISOString();
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const now = new Date();
      if (isEndDate) {
        now.setFullYear(now.getFullYear() + 100);
      }
      return now.toISOString();
    }
    return date.toISOString();
  } catch {
    const now = new Date();
    if (isEndDate) {
      now.setFullYear(now.getFullYear() + 100);
    }
    return now.toISOString();
  }
}

// Map whitelists to new format
function mapWhitelists(
  oldWhitelists: OldWhitelist[],
  parkSpotMap: Map<string, string>,
  tenancyMap: Map<string, string>
): Whitelist[] {
  const whitelists: Whitelist[] = [];
  let skippedCount = 0;

  for (const record of oldWhitelists) {
    // Skip if missing required fields
    if (!record.vehical_registration || !record.email || !record.car_park_id) {
      skippedCount++;
      continue;
    }

    // Find the sub car park code from the park_spot mapping
    const subCarParkCode = parkSpotMap.get(record.car_park_id);

    if (!subCarParkCode) {
      console.warn(
        `⚠️  Warning: car_park_id ${record.car_park_id} not found in park_spot data for whitelist ${record.id}`
      );
      skippedCount++;
      continue;
    }

    // Find tenancy ID if available
    let tenancyId: string | null = null;
    if (record.tenancy) {
      tenancyId = tenancyMap.get(record.tenancy) || null;
    }

    const whitelistType = mapWhitelistType(record.duration);
    const startDate = parseDate(record.start_date, false);
    const endDate = parseDate(record.end_date, true);

    const whitelist: Whitelist = {
      registrationNumber: record.vehical_registration.toUpperCase(),
      comments: record.comments,
      email: record.email,
      whitelistType: whitelistType,
      token: record.ref,
      duration: 0, // Will be calculated based on type
      startDate: startDate,
      endDate: endDate,
      subCarParkCode: subCarParkCode,
      tenancyId: tenancyId,
      status: "Active",
      oldDashboardId: record.id,
      oldDashboardCarParkId: record.car_park_id,
      oldDashboardTenancyId: record.tenancy || undefined,
    };

    whitelists.push(whitelist);
  }

  if (skippedCount > 0) {
    console.log(
      `\nℹ️  Skipped ${skippedCount} whitelists due to missing data or invalid car park references`
    );
  }

  return whitelists;
}

// Main execution
async function main() {
  try {
    console.log("Starting Whitelist SQL to JSON mapping...\n");

    // Read whitelist SQL file
    const whitelistSqlPath = "C:\\Users\\Cyam\\Downloads\\whitelist (1).sql";
    console.log(`Reading whitelist SQL file from: ${whitelistSqlPath}`);

    if (!fs.existsSync(whitelistSqlPath)) {
      throw new Error(`Whitelist SQL file not found at: ${whitelistSqlPath}`);
    }

    const whitelistSqlContent = fs.readFileSync(whitelistSqlPath, "utf-8");
    console.log("Whitelist SQL file read successfully");

    // Read park_spot SQL file for mapping
    const parkSpotSqlPath = "C:\\Users\\Cyam\\Downloads\\park_spot.sql";
    console.log(`Reading park_spot SQL file from: ${parkSpotSqlPath}`);

    if (!fs.existsSync(parkSpotSqlPath)) {
      throw new Error(`Park spot SQL file not found at: ${parkSpotSqlPath}`);
    }

    const parkSpotSqlContent = fs.readFileSync(parkSpotSqlPath, "utf-8");
    console.log("Park spot SQL file read successfully");

    // Read tenancies SQL file for mapping
    const tenanciesSqlPath = "C:\\Users\\Cyam\\Downloads\\tenancies.sql";
    console.log(`Reading tenancies SQL file from: ${tenanciesSqlPath}`);

    if (!fs.existsSync(tenanciesSqlPath)) {
      throw new Error(`Tenancies SQL file not found at: ${tenanciesSqlPath}`);
    }

    const tenanciesSqlContent = fs.readFileSync(tenanciesSqlPath, "utf-8");
    console.log("Tenancies SQL file read successfully\n");

    // Parse SQL data
    console.log("Parsing whitelist SQL INSERT statements...");
    const oldWhitelists = parseSqlInserts(
      whitelistSqlContent,
      "whitelist"
    ) as OldWhitelist[];
    console.log(`Parsed ${oldWhitelists.length} whitelist records from SQL`);

    console.log("Parsing park_spot SQL INSERT statements...");
    const parkSpots = parseSqlInserts(
      parkSpotSqlContent,
      "park_spot"
    ) as OldParkSpot[];
    console.log(`Parsed ${parkSpots.length} park spot records from SQL`);

    console.log("Parsing tenancies SQL INSERT statements...");
    const tenancies = parseSqlInserts(
      tenanciesSqlContent,
      "tenancies"
    ) as OldTenancy[];
    console.log(`Parsed ${tenancies.length} tenancy records from SQL\n`);

    // Create mapping from car_park_id to car_park_code (only for child spots)
    console.log("Creating car park ID to code mapping...");
    const parkSpotMap = new Map<string, string>();
    let childSpotsCount = 0;

    for (const spot of parkSpots) {
      // Only map child spots since whitelists belong to sub car parks
      if (spot.spot_type === "child") {
        parkSpotMap.set(spot.id.toString(), spot.car_park_code);
        childSpotsCount++;
      }
    }
    console.log(
      `Created mapping for ${childSpotsCount} child car parks (sub car parks)`
    );

    // Create mapping from tenancy id to tenancy id (just for reference)
    console.log("Creating tenancy ID mapping...");
    const tenancyMap = new Map<string, string>();
    for (const tenancy of tenancies) {
      tenancyMap.set(tenancy.id.toString(), tenancy.id.toString());
    }
    console.log(`Created mapping for ${tenancyMap.size} tenancies\n`);

    // Map to new format
    console.log("Mapping whitelists to new format...");
    const whitelists = mapWhitelists(oldWhitelists, parkSpotMap, tenancyMap);
    console.log(`Successfully mapped ${whitelists.length} whitelists\n`);

    // Write JSON files (resolve to project root assets folder)
    const assetsDir = path.join(process.cwd(), "assets", "seeding-data");

    // Backup existing file if it exists
    const whitelistsPath = path.join(assetsDir, "whitelists.json");

    if (fs.existsSync(whitelistsPath)) {
      const backupPath = path.join(assetsDir, "whitelists.backup.json");
      fs.copyFileSync(whitelistsPath, backupPath);
      console.log(
        `Backed up existing whitelists.json to whitelists.backup.json`
      );
    }

    // Write new file
    fs.writeFileSync(
      whitelistsPath,
      JSON.stringify(whitelists, null, 2),
      "utf-8"
    );
    console.log(`✓ Written ${whitelists.length} whitelists to whitelists.json`);

    console.log("\n✅ Mapping completed successfully!");
    console.log("\nSummary:");
    console.log(`- Total whitelist records processed: ${oldWhitelists.length}`);
    console.log(`- Whitelists successfully mapped: ${whitelists.length}`);
    console.log(
      `- Whitelists skipped: ${oldWhitelists.length - whitelists.length}`
    );
    console.log(`- Sub car parks available for mapping: ${childSpotsCount}`);
  } catch (error) {
    console.error("❌ Error during mapping:", error);
    process.exit(1);
  }
}

main();

/**
 * Script to map old dashboard SQL data to new database JSON format
 * This script reads the park_spot SQL data and creates:
 * 1. master-car-parks.json (parent car parks with spot_type='parent')
 * 2. sub-car-parks.json (child car parks with spot_type='child')
 * 3. old-dashboard-sub-car-parks.json (backup of original data)
 */

import * as fs from "fs";
import * as path from "path";

interface OldParkSpot {
  id: number;
  car_park_name: string | null;
  car_space: string | null;
  car_park_type: string | null;
  location: string | null;
  lat: string | null;
  lang: string | null;
  description: string | null;
  status: string;
  car_park_code: string;
  slug: string | null;
  tags: string | null;
  created_at: string;
  car_park_id_code: string | null;
  hours: string | null;
  scheduled: string | null;
  tenant_email_check: string | null;
  filename: string | null;
  filetype: string | null;
  geolocation: string | null;
  event: string | null;
  event_date: string | null;
  event_expiry_date: string | null;
  whitelist_email: string | null;
  check_smtp: string | null;
  car_park_parent_code: string | null;
  spot_type: string | null;
  pre_booking: string | null;
  logo: string | null;
  permit: string | null;
  expiry: string | null;
}

interface MasterCarPark {
  carParkName: string;
  carParkType: string;
  masterCarParkCode: string;
  status: string;
  oldDashboardId?: number;
}

interface SubCarPark {
  carParkName: string;
  carSpace: number;
  location: string;
  lat: number;
  lang: number;
  description: string | null;
  subCarParkCode: string;
  freeHours: number;
  tenantEmailCheck: boolean;
  geolocation: boolean;
  event: boolean;
  eventDate?: string;
  eventExpiryDate?: string;
  status: string;
  noOfPermitsPerRegNo: number;
  masterCarParkName: string;
  oldDashboardId?: number;
  oldDashboardParentCode?: string;
}

// Parse SQL INSERT statements
function parseSqlInserts(sqlContent: string): OldParkSpot[] {
  const records: OldParkSpot[] = [];

  // Find all INSERT INTO statements
  const insertRegex =
    /INSERT INTO `park_spot`[^(]*\(([^)]+)\)\s+VALUES\s+([\s\S]*?);/gi;
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
        records.push(record as OldParkSpot);
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

// Map old data to new format
function mapToNewFormat(oldRecords: OldParkSpot[]): {
  masterCarParks: MasterCarPark[];
  subCarParks: SubCarPark[];
} {
  const masterCarParks: MasterCarPark[] = [];
  const subCarParks: SubCarPark[] = [];
  const masterCarParkMap = new Map<string, string>(); // code -> name

  // First pass: Create master car parks (parents)
  for (const record of oldRecords) {
    if (record.spot_type === "parent") {
      const masterCarPark: MasterCarPark = {
        carParkName: record.car_park_name || `Car Park ${record.id}`,
        carParkType: record.car_park_type || "Commercial",
        masterCarParkCode: record.car_park_code,
        status: record.status === "Active" ? "Active" : "Inactive",
        oldDashboardId: record.id,
      };

      masterCarParks.push(masterCarPark);
      masterCarParkMap.set(record.car_park_code, masterCarPark.carParkName);
    }
  }

  // Second pass: Create sub car parks (children)
  for (const record of oldRecords) {
    if (record.spot_type === "child") {
      // Find parent name by parent code
      let masterCarParkName = "Unknown Master Car Park";

      if (record.car_park_parent_code) {
        // First try to match by car_park_code
        const parentName = masterCarParkMap.get(record.car_park_parent_code);
        if (parentName) {
          masterCarParkName = parentName;
        } else {
          // Parent not found by code, try to find by ID (as string)
          const parentRecord = oldRecords.find(
            (r) =>
              r.id.toString() === record.car_park_parent_code ||
              r.car_park_code === record.car_park_parent_code
          );
          if (parentRecord && parentRecord.car_park_name) {
            masterCarParkName = parentRecord.car_park_name;
          }
        }
      }

      // Parse and cap numeric values to prevent overflow
      const parseHours = (hours: string | null): number => {
        if (!hours) return 2;
        const parsed = parseFloat(hours);
        // Cap at 999999.99 (max for decimal(10,2) is 99999999.99 but being safe)
        // Values like "100000000000000000000000000000000000000" will be capped
        return isNaN(parsed) ? 2 : Math.min(parsed, 999999.99);
      };

      const parseCarSpace = (space: string | null): number => {
        if (!space) return 100;
        const parsed = parseInt(space);
        // Cap at 999999999 (reasonable max for car spaces)
        return isNaN(parsed) ? 100 : Math.min(parsed, 999999999);
      };

      const subCarPark: SubCarPark = {
        carParkName: record.car_park_name || `Sub Car Park ${record.id}`,
        carSpace: parseCarSpace(record.car_space),
        location: record.location || "Unknown Location",
        lat: parseFloat(record.lat || "0"),
        lang: parseFloat(record.lang || "0"),
        description: record.description,
        subCarParkCode: record.car_park_code,
        freeHours: parseHours(record.hours),
        tenantEmailCheck:
          record.tenant_email_check === "1" ||
          record.tenant_email_check === "yes",
        geolocation: record.geolocation === "1" || record.geolocation === "yes",
        event: record.event === "yes" || record.event === "1",
        status: record.status === "Active" ? "Active" : "Inactive",
        noOfPermitsPerRegNo: 1, // Default value
        masterCarParkName: masterCarParkName,
        oldDashboardId: record.id,
        oldDashboardParentCode: record.car_park_parent_code || undefined,
      };

      // Add event dates if event is true
      if (subCarPark.event && record.event_date) {
        subCarPark.eventDate = record.event_date;
      }

      if (subCarPark.event && record.event_expiry_date) {
        subCarPark.eventExpiryDate = record.event_expiry_date;
      }

      subCarParks.push(subCarPark);
    }
  }

  return { masterCarParks, subCarParks };
}

// Main execution
async function main() {
  try {
    console.log("Starting SQL to JSON mapping...\n");

    // Read SQL file
    const sqlFilePath = "C:\\Users\\Cyam\\Downloads\\park_spot.sql";
    console.log(`Reading SQL file from: ${sqlFilePath}`);

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found at: ${sqlFilePath}`);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");
    console.log("SQL file read successfully\n");

    // Parse SQL data
    console.log("Parsing SQL INSERT statements...");
    const oldRecords = parseSqlInserts(sqlContent);
    console.log(`Parsed ${oldRecords.length} records from SQL\n`);

    // Map to new format
    console.log("Mapping data to new format...");
    const { masterCarParks, subCarParks } = mapToNewFormat(oldRecords);
    console.log(`Created ${masterCarParks.length} master car parks`);
    console.log(`Created ${subCarParks.length} sub car parks\n`);

    // Write JSON files
    const assetsDir = path.join(__dirname, "..", "assets", "seeding-data");

    // Backup existing files if they exist
    const masterCarParksPath = path.join(assetsDir, "master-car-parks.json");
    const subCarParksPath = path.join(assetsDir, "sub-car-parks.json");

    if (fs.existsSync(masterCarParksPath)) {
      const backupPath = path.join(assetsDir, "master-car-parks.backup.json");
      fs.copyFileSync(masterCarParksPath, backupPath);
      console.log(
        `Backed up existing master-car-parks.json to master-car-parks.backup.json`
      );
    }

    if (fs.existsSync(subCarParksPath)) {
      const backupPath = path.join(assetsDir, "sub-car-parks.backup.json");
      fs.copyFileSync(subCarParksPath, backupPath);
      console.log(
        `Backed up existing sub-car-parks.json to sub-car-parks.backup.json\n`
      );
    }

    // Write new files
    fs.writeFileSync(
      masterCarParksPath,
      JSON.stringify(masterCarParks, null, 2),
      "utf-8"
    );
    console.log(
      `✓ Written ${masterCarParks.length} master car parks to master-car-parks.json`
    );

    fs.writeFileSync(
      subCarParksPath,
      JSON.stringify(subCarParks, null, 2),
      "utf-8"
    );
    console.log(
      `✓ Written ${subCarParks.length} sub car parks to sub-car-parks.json`
    );

    // Write original data for reference
    const oldDashboardPath = path.join(assetsDir, "old-dashboard-data.json");
    fs.writeFileSync(
      oldDashboardPath,
      JSON.stringify(oldRecords, null, 2),
      "utf-8"
    );
    console.log(
      `✓ Written ${oldRecords.length} original records to old-dashboard-data.json`
    );

    console.log("\n✅ Mapping completed successfully!");
    console.log("\nSummary:");
    console.log(`- Total records processed: ${oldRecords.length}`);
    console.log(`- Master car parks created: ${masterCarParks.length}`);
    console.log(`- Sub car parks created: ${subCarParks.length}`);
    console.log(
      `- Records without spot_type: ${oldRecords.filter((r) => !r.spot_type).length}`
    );
  } catch (error) {
    console.error("❌ Error during mapping:", error);
    process.exit(1);
  }
}

main();

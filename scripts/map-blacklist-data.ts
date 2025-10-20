/**
 * Script to map old dashboard blacklist SQL data to new database JSON format
 * This script reads the black_list_reg SQL data and creates blacklist.json
 * with proper sub car park mapping
 */

import * as fs from "fs";
import * as path from "path";

interface OldBlacklist {
  id: number;
  reg_no: string | null;
  email: string | null;
  status: string;
  comments: string | null;
  created_at: string | null;
  updated_at: string;
  spot_code: string | null;
  user_id: string | null;
}

interface OldParkSpot {
  id: number;
  car_park_code: string;
  car_park_name: string | null;
  spot_type: string | null;
}

interface Blacklist {
  registrationNumber: string;
  email: string;
  comments: string | null;
  subCarParkCode: string;
  oldDashboardId?: number;
  oldDashboardSpotCode?: string;
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

// Map blacklists to new format
function mapBlacklists(
  oldBlacklists: OldBlacklist[],
  parkSpotMap: Map<string, string>
): Blacklist[] {
  const blacklists: Blacklist[] = [];
  let skippedCount = 0;

  for (const record of oldBlacklists) {
    // Skip if missing required fields
    if (!record.reg_no || !record.spot_code) {
      skippedCount++;
      continue;
    }

    // Find the sub car park code from the park_spot mapping
    // spot_code in old system maps to car_park_code in park_spot
    const subCarParkCode = parkSpotMap.get(record.spot_code);

    if (!subCarParkCode) {
      console.warn(
        `⚠️  Warning: spot_code ${record.spot_code} not found in park_spot data for blacklist ${record.id}`
      );
      skippedCount++;
      continue;
    }

    const blacklist: Blacklist = {
      registrationNumber: record.reg_no.toUpperCase(),
      email: record.email || "noemail@onlypark.com.au",
      comments: record.comments,
      subCarParkCode: subCarParkCode,
      oldDashboardId: record.id,
      oldDashboardSpotCode: record.spot_code,
    };

    blacklists.push(blacklist);
  }

  if (skippedCount > 0) {
    console.log(
      `\nℹ️  Skipped ${skippedCount} blacklists due to missing data or invalid car park references`
    );
  }

  return blacklists;
}

// Main execution
async function main() {
  try {
    console.log("Starting Blacklist SQL to JSON mapping...\n");

    // Read blacklist SQL file
    const blacklistSqlPath = "C:\\Users\\Cyam\\Downloads\\black_list_reg.sql";
    console.log(`Reading blacklist SQL file from: ${blacklistSqlPath}`);

    if (!fs.existsSync(blacklistSqlPath)) {
      throw new Error(`Blacklist SQL file not found at: ${blacklistSqlPath}`);
    }

    const blacklistSqlContent = fs.readFileSync(blacklistSqlPath, "utf-8");
    console.log("Blacklist SQL file read successfully");

    // Read park_spot SQL file for mapping
    const parkSpotSqlPath = "C:\\Users\\Cyam\\Downloads\\park_spot.sql";
    console.log(`Reading park_spot SQL file from: ${parkSpotSqlPath}`);

    if (!fs.existsSync(parkSpotSqlPath)) {
      throw new Error(`Park spot SQL file not found at: ${parkSpotSqlPath}`);
    }

    const parkSpotSqlContent = fs.readFileSync(parkSpotSqlPath, "utf-8");
    console.log("Park spot SQL file read successfully\n");

    // Parse SQL data
    console.log("Parsing blacklist SQL INSERT statements...");
    const oldBlacklists = parseSqlInserts(
      blacklistSqlContent,
      "black_list_reg"
    ) as OldBlacklist[];
    console.log(`Parsed ${oldBlacklists.length} blacklist records from SQL`);

    console.log("Parsing park_spot SQL INSERT statements...");
    const parkSpots = parseSqlInserts(
      parkSpotSqlContent,
      "park_spot"
    ) as OldParkSpot[];
    console.log(`Parsed ${parkSpots.length} park spot records from SQL\n`);

    // Create mapping from spot_code to car_park_code (only for child spots)
    // Note: In the old system, spot_code refers to the sub car park
    // We need to map spot_code (which is actually the park spot ID) to car_park_code
    console.log("Creating spot code to car park code mapping...");
    const parkSpotMap = new Map<string, string>();
    let childSpotsCount = 0;

    // First, create a map from park spot ID to car_park_code
    const idToCodeMap = new Map<string, string>();
    for (const spot of parkSpots) {
      if (spot.spot_type === "child") {
        idToCodeMap.set(spot.id.toString(), spot.car_park_code);
        childSpotsCount++;
      }
    }

    // Now map spot_code (which appears to be the park spot ID) to car_park_code
    for (const [id, code] of idToCodeMap.entries()) {
      parkSpotMap.set(id, code);
    }

    // Also map car_park_code to itself for cases where spot_code is already the code
    for (const spot of parkSpots) {
      if (spot.spot_type === "child") {
        parkSpotMap.set(spot.car_park_code, spot.car_park_code);
      }
    }

    console.log(
      `Created mapping for ${childSpotsCount} child car parks (sub car parks)\n`
    );

    // Map to new format
    console.log("Mapping blacklists to new format...");
    const blacklists = mapBlacklists(oldBlacklists, parkSpotMap);
    console.log(`Successfully mapped ${blacklists.length} blacklists\n`);

    // Write JSON files (resolve to project root assets folder)
    const assetsDir = path.join(process.cwd(), "assets", "seeding-data");

    // Backup existing file if it exists
    const blacklistsPath = path.join(assetsDir, "blacklists.json");

    if (fs.existsSync(blacklistsPath)) {
      const backupPath = path.join(assetsDir, "blacklists.backup.json");
      fs.copyFileSync(blacklistsPath, backupPath);
      console.log(
        `Backed up existing blacklists.json to blacklists.backup.json`
      );
    }

    // Write new file
    fs.writeFileSync(
      blacklistsPath,
      JSON.stringify(blacklists, null, 2),
      "utf-8"
    );
    console.log(`✓ Written ${blacklists.length} blacklists to blacklists.json`);

    console.log("\n✅ Mapping completed successfully!");
    console.log("\nSummary:");
    console.log(`- Total blacklist records processed: ${oldBlacklists.length}`);
    console.log(`- Blacklists successfully mapped: ${blacklists.length}`);
    console.log(
      `- Blacklists skipped: ${oldBlacklists.length - blacklists.length}`
    );
    console.log(`- Sub car parks available for mapping: ${childSpotsCount}`);

    // Show some examples
    console.log("\nExample mappings:");
    blacklists.slice(0, 5).forEach((blacklist) => {
      console.log(
        `  - ${blacklist.registrationNumber} (${blacklist.email}) → ${blacklist.subCarParkCode}`
      );
    });
  } catch (error) {
    console.error("❌ Error during mapping:", error);
    process.exit(1);
  }
}

main();

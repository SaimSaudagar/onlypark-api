/**
 * Script to map old dashboard whitelist company SQL data to new database JSON format
 * This script reads the white_list_company SQL data and creates whitelist-companies.json
 * with proper sub car park code mapping
 */

import * as fs from "fs";
import * as path from "path";

interface OldWhitelistCompany {
  id: number;
  spot_id: string | null;
  hours: string | null; // Actually contains domain/email in old system
  company_name: string | null;
  created_at: string;
  updated_at: string | null;
}

interface OldParkSpot {
  id: number;
  car_park_code: string;
  car_park_name: string | null;
  spot_type: string | null;
}

interface WhitelistCompany {
  companyName: string;
  domainName: string;
  subCarParkCode: string;
  oldDashboardId?: number;
  oldDashboardSpotId?: string;
}

// Parse SQL INSERT statements
function parseSqlInserts(
  sqlContent: string,
  tableName: string
): OldWhitelistCompany[] | OldParkSpot[] {
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

// Map whitelist companies to new format
function mapWhitelistCompanies(
  oldCompanies: OldWhitelistCompany[],
  parkSpotMap: Map<string, string>
): WhitelistCompany[] {
  const companies: WhitelistCompany[] = [];
  let skippedCount = 0;

  for (const record of oldCompanies) {
    // Skip if missing required fields
    if (!record.company_name || !record.hours || !record.spot_id) {
      skippedCount++;
      continue;
    }

    // Find the sub car park code from the park_spot mapping
    const subCarParkCode = parkSpotMap.get(record.spot_id);

    if (!subCarParkCode) {
      console.warn(
        `⚠️  Warning: spot_id ${record.spot_id} not found in park_spot data for whitelist company ${record.id} (${record.company_name})`
      );
      skippedCount++;
      continue;
    }

    // In the old system, 'hours' field actually contains the domain/email
    // This is a quirk of the old database design
    const domainName = record.hours;

    const company: WhitelistCompany = {
      companyName: record.company_name,
      domainName: domainName,
      subCarParkCode: subCarParkCode,
      oldDashboardId: record.id,
      oldDashboardSpotId: record.spot_id,
    };

    companies.push(company);
  }

  if (skippedCount > 0) {
    console.log(
      `\nℹ️  Skipped ${skippedCount} whitelist companies due to missing data or invalid car park references`
    );
  }

  return companies;
}

// Main execution
async function main() {
  try {
    console.log("Starting Whitelist Companies SQL to JSON mapping...\n");

    // Read whitelist companies SQL file
    const companiesSqlPath =
      "C:\\Users\\Cyam\\Downloads\\white_list_company.sql";
    console.log(
      `Reading whitelist companies SQL file from: ${companiesSqlPath}`
    );

    if (!fs.existsSync(companiesSqlPath)) {
      throw new Error(
        `Whitelist companies SQL file not found at: ${companiesSqlPath}`
      );
    }

    const companiesSqlContent = fs.readFileSync(companiesSqlPath, "utf-8");
    console.log("Whitelist companies SQL file read successfully");

    // Read park_spot SQL file for mapping
    const parkSpotSqlPath = "C:\\Users\\Cyam\\Downloads\\park_spot.sql";
    console.log(`Reading park_spot SQL file from: ${parkSpotSqlPath}`);

    if (!fs.existsSync(parkSpotSqlPath)) {
      throw new Error(`Park spot SQL file not found at: ${parkSpotSqlPath}`);
    }

    const parkSpotSqlContent = fs.readFileSync(parkSpotSqlPath, "utf-8");
    console.log("Park spot SQL file read successfully\n");

    // Parse SQL data
    console.log("Parsing whitelist companies SQL INSERT statements...");
    const oldCompanies = parseSqlInserts(
      companiesSqlContent,
      "white_list_company"
    ) as OldWhitelistCompany[];
    console.log(
      `Parsed ${oldCompanies.length} whitelist company records from SQL`
    );

    console.log("Parsing park_spot SQL INSERT statements...");
    const parkSpots = parseSqlInserts(
      parkSpotSqlContent,
      "park_spot"
    ) as OldParkSpot[];
    console.log(`Parsed ${parkSpots.length} park spot records from SQL\n`);

    // Create mapping from spot_id to car_park_code (only for child spots)
    console.log("Creating spot ID to car park code mapping...");
    const parkSpotMap = new Map<string, string>();
    let childSpotsCount = 0;

    for (const spot of parkSpots) {
      // Only map child spots since whitelist companies belong to sub car parks
      if (spot.spot_type === "child") {
        parkSpotMap.set(spot.id.toString(), spot.car_park_code);
        childSpotsCount++;
      }
    }
    console.log(
      `Created mapping for ${childSpotsCount} child car parks (sub car parks)\n`
    );

    // Map to new format
    console.log("Mapping whitelist companies to new format...");
    const companies = mapWhitelistCompanies(oldCompanies, parkSpotMap);
    console.log(
      `Successfully mapped ${companies.length} whitelist companies\n`
    );

    // Write JSON files
    const assetsDir = path.join(__dirname, "..", "assets", "seeding-data");

    // Create whitelist-companies.json (note the plural and hyphen for consistency)
    const companiesPath = path.join(assetsDir, "whitelist-companies.json");

    if (fs.existsSync(companiesPath)) {
      const backupPath = path.join(
        assetsDir,
        "whitelist-companies.backup.json"
      );
      fs.copyFileSync(companiesPath, backupPath);
      console.log(
        `Backed up existing whitelist-companies.json to whitelist-companies.backup.json`
      );
    }

    // Write new file
    fs.writeFileSync(
      companiesPath,
      JSON.stringify(companies, null, 2),
      "utf-8"
    );
    console.log(
      `✓ Written ${companies.length} whitelist companies to whitelist-companies.json`
    );

    // Write original data for reference
    const oldCompaniesPath = path.join(
      assetsDir,
      "old-dashboard-whitelist-companies.json"
    );
    fs.writeFileSync(
      oldCompaniesPath,
      JSON.stringify(oldCompanies, null, 2),
      "utf-8"
    );
    console.log(
      `✓ Written ${oldCompanies.length} original whitelist company records to old-dashboard-whitelist-companies.json`
    );

    console.log("\n✅ Mapping completed successfully!");
    console.log("\nSummary:");
    console.log(
      `- Total whitelist company records processed: ${oldCompanies.length}`
    );
    console.log(
      `- Whitelist companies successfully mapped: ${companies.length}`
    );
    console.log(
      `- Whitelist companies skipped: ${oldCompanies.length - companies.length}`
    );
    console.log(`- Sub car parks available for mapping: ${childSpotsCount}`);

    // Show some examples
    console.log("\nExample mappings:");
    companies.slice(0, 5).forEach((company) => {
      console.log(
        `  - ${company.companyName} (@${company.domainName}) → ${company.subCarParkCode}`
      );
    });
  } catch (error) {
    console.error("❌ Error during mapping:", error);
    process.exit(1);
  }
}

main();

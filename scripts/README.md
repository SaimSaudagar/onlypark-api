# Data Migration Scripts

This directory contains scripts to migrate data from the old OnlyPark dashboard to the new system.

## Available Scripts

### 1. Map Old Dashboard Data (`map-old-dashboard-data.ts`)
Maps old `park_spot` SQL data to master and sub car parks JSON format.

**Usage:**
```bash
npm run build
node dist/scripts/map-old-dashboard-data.js
```

**Input:** `C:\Users\Cyam\Downloads\park_spot.sql`

**Output:**
- `assets/seeding-data/master-car-parks.json`
- `assets/seeding-data/sub-car-parks.json`
- `assets/seeding-data/old-dashboard-data.json` (backup)

---

### 2. Map Tenancies Data (`map-tenancies-data.ts`)
Maps old `tenancies` SQL data to tenancies JSON format.

**Usage:**
```bash
npm run build
node dist/scripts/map-tenancies-data.js
```

**Input:**
- `C:\Users\Cyam\Downloads\tenancies.sql`
- `C:\Users\Cyam\Downloads\park_spot.sql`

**Output:**
- `assets/seeding-data/tenancies.json`
- `assets/seeding-data/old-dashboard-tenancies.json` (backup)

---

### 3. Map Whitelist Companies Data (`map-whitelist-companies-data.ts`)
Maps old `white_list_company` SQL data to whitelist companies JSON format.

**Usage:**
```bash
npm run build
node dist/scripts/map-whitelist-companies-data.js
```

**Input:**
- `C:\Users\Cyam\Downloads\white_list_company.sql`
- `C:\Users\Cyam\Downloads\park_spot.sql`

**Output:**
- `assets/seeding-data/whitelist-companies.json`
- `assets/seeding-data/old-dashboard-whitelist-companies.json` (backup)

---

### 4. Map Whitelist Data (`map-whitelist-data.ts`) 🆕
Maps old `whitelist` SQL data to whitelist entries JSON format.

**Usage:**
```bash
npm run build
node dist/scripts/map-whitelist-data.js
```

**Input:**
- `C:\Users\Cyam\Downloads\whitelist (1).sql`
- `C:\Users\Cyam\Downloads\park_spot.sql`
- `C:\Users\Cyam\Downloads\tenancies.sql`

**Output:**
- `assets/seeding-data/whitelists.json`

**Features:**
- Maps vehicle registrations to sub car parks
- Links whitelists to tenancies where possible
- Converts old duration types to new whitelist types
- Handles permanent whitelists with 100-year end dates

---

### 5. Map Blacklist Data (`map-blacklist-data.ts`) 🆕
Maps old `black_list_reg` SQL data to blacklist entries JSON format.

**Usage:**
```bash
npm run build
node dist/scripts/map-blacklist-data.js
```

**Input:**
- `C:\Users\Cyam\Downloads\black_list_reg.sql`
- `C:\Users\Cyam\Downloads\park_spot.sql`

**Output:**
- `assets/seeding-data/blacklists.json`

**Features:**
- Maps blacklisted registrations to sub car parks
- Uses spot_code to find correct sub car park
- Provides default email for entries without email

---

## Running the Complete Migration

To run all migration scripts in order:

```bash
# 1. Build the project
npm run build

# 2. Map car parks (master and sub)
node dist/scripts/map-old-dashboard-data.js

# 3. Map tenancies
node dist/scripts/map-tenancies-data.js

# 4. Map whitelist companies
node dist/scripts/map-whitelist-companies-data.js

# 5. Map whitelists
node dist/scripts/map-whitelist-data.js

# 6. Map blacklists
node dist/scripts/map-blacklist-data.js

# 7. Run seeders to import data into database
npm run seed
```

---

## Seeding Data into Database

After running the migration scripts, use the seeder to import data:

```bash
npm run seed
```

This will run all seeders in the correct order:
1. Car Makes
2. Master Car Parks
3. Sub Car Parks
4. Tenancies
5. Whitelist Companies
6. **Whitelists** 🆕
7. **Blacklists** 🆕
8. Infringement Car Parks
9. Infringement Penalties
10. Infringement Reasons
11. Users

---

## Data Format

### Whitelist Entry
```json
{
  "registrationNumber": "543KR2",
  "comments": "Pool doctor",
  "email": "user@example.com",
  "whitelistType": "Permanent",
  "token": "3ZKUTAZSRI",
  "duration": 0,
  "startDate": "2025-05-14T23:17:02.000Z",
  "endDate": "2125-05-14T23:17:02.000Z",
  "subCarParkCode": "87",
  "tenancyId": null,
  "status": "Active",
  "oldDashboardId": 5377,
  "oldDashboardCarParkId": "87",
  "oldDashboardTenancyId": "97"
}
```

### Blacklist Entry
```json
{
  "registrationNumber": "422FH5",
  "email": "noemail@onlypark.com.au",
  "comments": "Repeated violations",
  "subCarParkCode": "48",
  "oldDashboardId": 27,
  "oldDashboardSpotCode": "48"
}
```

---

## Notes

- All scripts automatically create backups before overwriting existing JSON files
- Registration numbers are automatically converted to uppercase
- Scripts provide detailed logging and skip count for invalid records
- Old dashboard IDs are preserved for reference and troubleshooting
- Permanent whitelists are set with end dates 100 years in the future

---

## Troubleshooting

**Issue:** Script can't find SQL file
- **Solution:** Check that the file path in the script matches your actual file location
- Update the path in the script if your files are in a different location

**Issue:** Park spot not found warnings
- **Solution:** This is normal for orphaned records in the old database
- These records will be skipped and logged

**Issue:** Seeder fails with foreign key constraint
- **Solution:** Ensure you run seeders in the correct order (car parks → sub car parks → tenancies → whitelists/blacklists)

**Issue:** Duplicate entries
- **Solution:** Seeders check for existing records and skip duplicates
- You can safely run seeders multiple times


import * as fs from 'fs';
import * as path from 'path';

export class FileUtils {
  static getDataForSeeding(fileName: string) {
    const jsonFile = path.join(
      process.cwd(),
      'assets/seeding-data',
      `${fileName}.json`,
    );
    const fileContent = fs.readFileSync(jsonFile, 'utf-8');
    return JSON.parse(fileContent);
  }
}

import { Injectable, Logger } from "@nestjs/common";
import * as handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";

export interface ITemplateEngine {
  compile<T>(
    template: string,
    data: { [K in keyof T]: string },
  ): Promise<string>;
  compileFromFile<T>(
    templatePath: string,
    data: { [K in keyof T]: string },
  ): Promise<string>;
}

@Injectable()
export class TemplateEngineService implements ITemplateEngine {
  private readonly logger = new Logger(TemplateEngineService.name);

  async compile<T>(
    template: string,
    data: { [K in keyof T]: string },
  ): Promise<string> {
    try {
      const compiledTemplate = handlebars.compile(template);
      const result = compiledTemplate(data);
      return result;
    } catch (error) {
      this.logger.error(`Error compiling template: ${error.message}`);
      throw error;
    }
  }

  async compileFromFile<T>(
    templatePath: string,
    data: { [K in keyof T]: string },
  ): Promise<string> {
    try {
      const fullPath = path.join(
        process.cwd(),
        "assets",
        "templates",
        "html",
        templatePath,
      );

      if (!fs.existsSync(fullPath)) {
        throw new Error(`Template file not found: ${fullPath}`);
      }

      const templateContent = fs.readFileSync(fullPath, "utf-8");
      return await this.compile<T>(templateContent, data);
    } catch (error) {
      this.logger.error(`Error reading template file: ${error.message}`);
      throw error;
    }
  }
}

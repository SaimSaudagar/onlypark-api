import * as fs from "fs";
import * as path from "path";
import { Injectable } from "@nestjs/common";
import { FileTemplate } from "./file-template";
import { ITemplateStorage } from "../template-storage.interface";
import { FindTemplateResponse } from "../template-storage.dto";
import { FileType } from "../template-storage.enum";

@Injectable()
export class FileStorageService implements ITemplateStorage {
  private readonly dirPath: string = "";
  constructor() {}

  async get(templateKey: string): Promise<FindTemplateResponse> {
    const fileTemplate = FileTemplate.get(templateKey);
    if (!fileTemplate) {
      return null;
    }

    const content = this.getContent(fileTemplate);
    const result: FindTemplateResponse = {
      id: templateKey,
      templateKey: templateKey,
      titleTemplate: content.title,
      bodyTemplate: content.body,
      type: fileTemplate.type,
      lang: fileTemplate.lang,
      layout: fileTemplate.layout,
    };
    return result;
  }

  private getContent(request: {
    key: string;
    fileName: string;
    fileType: string;
    title: string;
    body: string;
    type: string;
    lang: string;
    layout: string;
  }): { title: string; body: string } {
    const result = {
      title: request.title,
      body: request.body,
    };
    switch (request.fileType) {
      case FileType.HTML:
        const body = this.getHtmlContent(request.fileName);
        result.body = body;
        break;
      case FileType.JSON:
        const jsonContent = this.getJsonContent(request.fileName);
        result.title = jsonContent.title;
        result.body = jsonContent.body;
        break;
    }
    return result;
  }

  private getHtmlContent(fileName: string) {
    const templatePath = path.join(
      process.cwd(),
      "assets/templates/html",
      fileName,
    );
    const content = fs.readFileSync(templatePath, "utf-8");
    return content;
  }

  private getJsonContent(fileName: string) {
    const templatePath = path.join(
      process.cwd(),
      "assets/templates/json",
      fileName,
    );
    const content = fs.readFileSync(templatePath, "utf-8");
    return JSON.parse(content);
  }
}

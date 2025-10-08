import { FindTemplateResponse } from "./template-storage.dto";

export abstract class ITemplateStorage {
  abstract get(templateKey: string): Promise<FindTemplateResponse>;
}

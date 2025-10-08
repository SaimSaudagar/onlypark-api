import { SetMetadata } from "@nestjs/common";

export const AUDITABLE_KEY = "auditable";
export const Auditable = () => SetMetadata(AUDITABLE_KEY, true);

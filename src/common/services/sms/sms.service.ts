import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SmsService {
  constructor(private readonly configService: ConfigService) {}

  async sendSms(to: string, message: string): Promise<boolean> {
    // TODO: Implement SMS sending logic
    console.log(`Sending SMS to ${to}: ${message}`);
    return true;
  }
}

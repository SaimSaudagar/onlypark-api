import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    // TODO: Implement email sending logic
    console.log(`Sending email to ${to}: ${subject}`);
    return true;
  }
}

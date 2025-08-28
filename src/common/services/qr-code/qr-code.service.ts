import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrCodeService {
  constructor(private readonly configService: ConfigService) {}

  async generateQrCode(data: string): Promise<string> {
    // TODO: Implement QR code generation
    console.log(`Generating QR code for: ${data}`);
    return 'base64-qr-code-data';
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QrCodeService } from './qr-code.service';

@Module({
  imports: [ConfigModule],
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule {}

import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class GetInfringementPaymentRequest {
  @IsNumber()
  @IsNotEmpty()
  ticketNumber: number;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;
}

export class GetInfringementPaymentResponse {
  ticketNumber: number;
  registration: string;
  carMake: string;
  date: string;
  time: string;
  amount: number;
  status: string;
  dueDate: string;
  reason: string;
  photos: object;
  stripePriceId: string;
}

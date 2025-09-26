import { IsNumber, IsNotEmpty } from 'class-validator';
import { InfringementStatus } from '../common/enums';




export class GetInfringementPaymentRequest {
  @IsNumber()
  @IsNotEmpty()
  ticketNumber: number;
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

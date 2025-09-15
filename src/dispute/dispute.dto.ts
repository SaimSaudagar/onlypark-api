import { DisputeStatus } from "../common/enums";
import { IsString, IsNotEmpty, IsNumber, IsObject } from "class-validator";

export class CreateDisputeResponse {
    id: string;
    infringementId: string;
    registrationNo: string;
    status: DisputeStatus;
    firstName: string;
    lastName: string;
    companyName: string;
    address: string;
    state: string;
    zipCode: string;
    mobileNumber: string;
    email: string;
    carMakeId: string;
    model: string;
    appeal: string;
    photos: object;
    ticketNumber: number;
}

export class CreateDisputeRequest {
    @IsString()
    @IsNotEmpty()
    registrationNo: string;

    @IsNumber()
    @IsNotEmpty()
    ticketNumber: number;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    companyName: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    zipCode: string;

    @IsString()
    @IsNotEmpty()
    mobileNumber: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    carMakeId: string;

    @IsString()
    @IsNotEmpty()
    model: string;

    @IsString()
    @IsNotEmpty()
    appeal: string;

    @IsObject()
    @IsNotEmpty()
    photos: object;
}
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { WhitelistType } from 'src/common/enums';

export class CreateSelfServeWhitelistRequest {
    @IsNotEmpty()
    @IsString()
    registrationNumber: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsUUID()
    subCarParkId: string;

    @IsNotEmpty()
    @IsUUID()
    tenancyId: string;
}

export class CreateSelfServeWhitelistResponse {
    id: string;
    registrationNumber: string;
    comments: string;
    email: string;
    subCarParkId: string;
    tenancyId: string;
    whitelistType: WhitelistType;
}

import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsBoolean, IsUUID, IsEmail, MinLength, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminStatus, UserType } from '../../common/enums';
import { Type } from 'class-transformer';

export class CreateProfileDto {
    @ApiProperty({ description: 'User ID to associate with this admin' })
    @IsNotEmpty()
    @IsUUID()
    userId: string;
}

export class CreateUserForProfileDto {
    @ApiProperty({ description: 'User full name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'User email address' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'User password - minimum 6 characters' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ description: 'User phone number' })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiPropertyOptional({ description: 'User profile image URL' })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiProperty({
        description: 'User type - must be ADMIN for admin users',
        enum: UserType,
        default: UserType.ADMIN
    })
    @IsEnum(UserType)
    type: UserType = UserType.ADMIN;
}

// Create Profile with User DTO - for creating admin with new user account
export class CreateProfileWithUserDto {
    @ApiProperty({ description: 'Admin code - must be unique' })
    @IsNotEmpty()
    @IsString()
    adminCode: string;

    @ApiPropertyOptional({ description: 'Department the admin belongs to' })
    @IsOptional()
    @IsString()
    department?: string;

    @ApiPropertyOptional({
        description: 'Whether admin can manage users',
        default: true
    })
    @IsOptional()
    @IsBoolean()
    canManageUsers?: boolean = true;

    @ApiPropertyOptional({
        description: 'Whether admin can manage roles',
        default: true
    })
    @IsOptional()
    @IsBoolean()
    canManageRoles?: boolean = true;

    @ApiPropertyOptional({
        description: 'Whether admin can manage system settings',
        default: true
    })
    @IsOptional()
    @IsBoolean()
    canManageSystem?: boolean = true;

    @ApiPropertyOptional({
        description: 'Admin status',
        enum: AdminStatus,
        default: AdminStatus.ACTIVE
    })
    @IsOptional()
    @IsEnum(AdminStatus)
    status?: AdminStatus = AdminStatus.ACTIVE;

    @ApiProperty({
        description: 'User account information for the admin',
        type: CreateUserForProfileDto
    })
    @ValidateNested()
    @Type(() => CreateUserForProfileDto)
    user: CreateUserForProfileDto;
}

// Update Profile DTO
export class UpdateProfileDto extends PartialType(CreateProfileDto) { }

// Query Profile DTO - for filtering and searching
export class QueryProfileDto {
    @ApiPropertyOptional({ description: 'Filter by admin code' })
    @IsOptional()
    @IsString()
    adminCode?: string;

    @ApiPropertyOptional({ description: 'Filter by department' })
    @IsOptional()
    @IsString()
    department?: string;

    @ApiPropertyOptional({ description: 'Filter by user management permission' })
    @IsOptional()
    @IsBoolean()
    canManageUsers?: boolean;

    @ApiPropertyOptional({ description: 'Filter by role management permission' })
    @IsOptional()
    @IsBoolean()
    canManageRoles?: boolean;

    @ApiPropertyOptional({ description: 'Filter by system management permission' })
    @IsOptional()
    @IsBoolean()
    canManageSystem?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by status',
        enum: AdminStatus
    })
    @IsOptional()
    @IsEnum(AdminStatus)
    status?: AdminStatus;

    @ApiPropertyOptional({ description: 'Filter by user name' })
    @IsOptional()
    @IsString()
    userName?: string;

    @ApiPropertyOptional({ description: 'Filter by user email' })
    @IsOptional()
    @IsString()
    userEmail?: string;
}

// Profile Response DTO
export class ProfileResponseDto {
    @ApiProperty({ description: 'Admin unique identifier' })
    id: string;

    @ApiProperty({ description: 'Admin code' })
    adminCode: string;

    @ApiPropertyOptional({ description: 'Department the admin belongs to' })
    department?: string;

    @ApiProperty({ description: 'Whether admin can manage users' })
    canManageUsers: boolean;

    @ApiProperty({ description: 'Whether admin can manage roles' })
    canManageRoles: boolean;

    @ApiProperty({ description: 'Whether admin can manage system settings' })
    canManageSystem: boolean;

    @ApiPropertyOptional({ description: 'Last login timestamp' })
    lastLoginAt?: Date;

    @ApiProperty({ description: 'Total number of logins' })
    loginCount: number;

    @ApiProperty({
        description: 'Admin status',
        enum: AdminStatus
    })
    status: AdminStatus;

    @ApiProperty({ description: 'Creation timestamp' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp' })
    updatedAt: Date;

    @ApiProperty({ description: 'Associated user information' })
    user: {
        id: string;
        name: string;
        email: string;
        phoneNumber?: string;
        type: string;
        status: string;
    };
}

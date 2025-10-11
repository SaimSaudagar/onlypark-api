# File Upload Service

This service handles file uploads to AWS S3 for the OnlyPark API. It provides functionality to upload single or multiple files with validation and error handling.

## Features

- **S3 Integration**: Uploads files directly to AWS S3
- **File Validation**: Validates file type, size, and extension
- **Multiple File Support**: Handles single or multiple file uploads
- **Error Handling**: Comprehensive error handling with custom exceptions
- **File Deletion**: Ability to delete files from S3

## Configuration

The service requires the following environment variables:

```env
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

## Usage

### Single File Upload

```typescript
const fileUrl = await fileUploadService.uploadFile(file, "folder-name");
```

### Multiple File Upload

```typescript
const fileUrls = await fileUploadService.uploadMultipleFiles(files, "folder-name");
```

### File Deletion

```typescript
const success = await fileUploadService.deleteFile(fileUrl);
const success = await fileUploadService.deleteMultipleFiles(fileUrls);
```

## File Validation

The service validates files based on:

- **File Type**: Only images (JPEG, PNG, GIF, WebP)
- **File Size**: Maximum 5MB per file
- **File Extension**: Must match allowed extensions

## Integration with Controllers

### Dispute Controller

```typescript
@Post()
@UseInterceptors(FilesInterceptor("photos", 10))
@ApiConsumes("multipart/form-data")
create(
  @Body() request: CreateDisputeRequest,
  @UploadedFiles() photos?: Express.Multer.File[]
) {
  return this.disputeService.create(request, photos);
}
```

### Infringement Controller

```typescript
@Post("create")
@UseInterceptors(FilesInterceptor("photos", 10))
@ApiConsumes("multipart/form-data")
create(
  @Body() request: CreateInfringementRequest,
  @UploadedFiles() photos?: Express.Multer.File[]
) {
  return this.infringementService.create(request, photos);
}
```

### Profile Controller

```typescript
@Post()
@UseInterceptors(FileInterceptor("image"))
@ApiConsumes("multipart/form-data")
create(
  @Body() createProfileDto: CreateProfileDto,
  @UploadedFile() image?: Express.Multer.File
) {
  return this.profileService.create(createProfileDto, image);
}
```

## Error Handling

The service throws `BadRequestException` for:

- No file provided
- Invalid file type
- File size too large
- Invalid file extension
- S3 upload failures

## File Organization

Files are organized in S3 with the following structure:

```
bucket-name/
├── disputes/
│   ├── uuid1.jpg
│   └── uuid2.png
├── infringements/
│   ├── uuid3.jpg
│   └── uuid4.png
└── profiles/
    ├── uuid5.jpg
    └── uuid6.png
```

## Security

- Files are uploaded with public-read ACL for easy access
- UUID-based filenames prevent conflicts
- File validation prevents malicious uploads
- S3 credentials are managed securely through environment variables

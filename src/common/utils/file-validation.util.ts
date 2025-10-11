import { BadRequestException } from "@nestjs/common";

export interface FileValidationOptions {
  maxSize: number; // in bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export class FileValidationUtil {
  static validateFile(
    file: Express.Multer.File,
    options: FileValidationOptions
  ): void {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    // Validate file size
    if (file.size > options.maxSize) {
      const maxSizeMB = options.maxSize / (1024 * 1024);
      throw new BadRequestException(
        `File size too large. Maximum size is ${maxSizeMB}MB.`
      );
    }

    // Validate MIME type
    if (!options.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${options.allowedMimeTypes.join(", ")}`
      );
    }

    // Validate file extension
    const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
    if (!fileExtension || !options.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid file extension. Allowed extensions: ${options.allowedExtensions.join(", ")}`
      );
    }
  }

  static validateMultipleFiles(
    files: Express.Multer.File[],
    options: FileValidationOptions
  ): void {
    if (!files || files.length === 0) {
      return;
    }

    files.forEach((file, index) => {
      try {
        this.validateFile(file, options);
      } catch (error) {
        throw new BadRequestException(`File ${index + 1}: ${error.message}`);
      }
    });
  }

  static getImageValidationOptions(): FileValidationOptions {
    return {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ],
      allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
    };
  }
}

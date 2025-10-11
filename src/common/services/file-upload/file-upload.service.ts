import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { FileValidationUtil } from "../../utils/file-validation.util";

@Injectable()
export class FileUploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>("AWS_REGION"),
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get<string>(
          "AWS_SECRET_ACCESS_KEY"
        ),
      },
    });
    this.bucketName = this.configService.get<string>("AWS_S3_BUCKET_NAME");
  }

  async uploadFile(file: any, folder: string = "uploads"): Promise<string> {
    // Validate file using utility
    FileValidationUtil.validateFile(
      file,
      FileValidationUtil.getImageValidationOptions()
    );

    try {
      const fileExtension = file.originalname.split(".").pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      });

      await this.s3Client.send(command);

      // Return the public URL
      const region = this.configService.get<string>("AWS_REGION");
      return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw new BadRequestException("Failed to upload file");
    }
  }

  async uploadMultipleFiles(
    files: any[],
    folder: string = "uploads"
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    // Validate all files first
    FileValidationUtil.validateMultipleFiles(
      files,
      FileValidationUtil.getImageValidationOptions()
    );

    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Extract key from URL
      const url = new URL(fileUrl);
      const key = url.pathname.substring(1); // Remove leading slash

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      return false;
    }
  }

  async deleteMultipleFiles(fileUrls: string[]): Promise<boolean> {
    if (!fileUrls || fileUrls.length === 0) {
      return true;
    }

    const deletePromises = fileUrls.map((url) => this.deleteFile(url));
    const results = await Promise.all(deletePromises);
    return results.every((result) => result);
  }
}

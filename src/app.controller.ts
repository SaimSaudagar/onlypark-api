import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { Public } from "./common/decorators";

@ApiTags("Health Check")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "API is healthy" })
  getHello(): { message: string; timestamp: string; version: string } {
    return this.appService.getHello();
  }

  @Get("health")
  @Public()
  @ApiOperation({ summary: "Detailed health check" })
  @ApiResponse({ status: 200, description: "Detailed health status" })
  getHealth(): {
    status: string;
    timestamp: string;
    uptime: number;
    memory: NodeJS.MemoryUsage;
    version: string;
  } {
    return this.appService.getHealth();
  }
}

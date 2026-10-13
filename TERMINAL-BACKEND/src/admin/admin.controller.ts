import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AdminKeyGuard } from './admin-key.guard';

@Controller('admin')
@UseGuards(AdminKeyGuard)
@ApiSecurity('admin-key')
@ApiTags('Admin')
export class AdminController {
  @Get('ping')
  ping() {
    return { status: 'ok' };
  }
}
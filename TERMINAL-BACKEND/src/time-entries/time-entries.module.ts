import { Module } from '@nestjs/common';
import { CompaniesModule } from '../companies/companies.module';
import { TerminalModule } from '../terminal/terminal.module';
import { TimeEntriesAdminController } from './time-entries-admin.controller';
import { TimeEntriesAdminService } from './time-entries-admin.service';
import { TimeEntriesController } from './time-entries.controller';
import { TimeEntriesService } from './time-entries.service';

@Module({
  imports: [TerminalModule, CompaniesModule],
  controllers: [TimeEntriesController, TimeEntriesAdminController],
  providers: [TimeEntriesService, TimeEntriesAdminService],
})
export class TimeEntriesModule {}

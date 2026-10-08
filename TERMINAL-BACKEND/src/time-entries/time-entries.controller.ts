import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DeviceAuthGuard } from '../terminal/device-auth.guard';
import { CurrentDevice } from '../terminal/current-device.decorator';
import { TerminalDevice } from '../terminal/terminal-device.entity';
import { TimeEntriesService } from './time-entries.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';

@Controller('time-entries')
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(DeviceAuthGuard)
  clock(@CurrentDevice() device: TerminalDevice, @Body() dto: CreateTimeEntryDto) {
    return this.timeEntriesService.clock(device.id, dto.pin);
  }
}
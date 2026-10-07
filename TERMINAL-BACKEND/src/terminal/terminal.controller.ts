import { Body, Post, Controller, Get, UseGuards } from "@nestjs/common";
import { TerminalService } from "./terminal.service";
import { ActivateTerminalDto } from "./dto/activate-terminal.dto";
import { DeviceAuthGuard } from "./device-auth.guard";
import { CurrentDevice } from './current-device.decorator';
import { TerminalDevice } from './terminal-device.entity';
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller('terminal')
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}
    @Post('activate') 
    activate(@Body() dto: ActivateTerminalDto) {
        return this.terminalService.activate(dto.code);
    }
    
    @Get('ping')
    @ApiBearerAuth()
    @UseGuards(DeviceAuthGuard)
    ping(@CurrentDevice() device: TerminalDevice) {
      return { ok: true, id: device.id };
    }
        
}



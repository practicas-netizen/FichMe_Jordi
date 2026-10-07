import { Body, Post, Controller, Get, UseGuards } from "@nestjs/common";
import { TerminalService } from "./terminal.service";
import { ActivateTerminalDto } from "./dto/activate-terminal.dto";
import { DeviceAuthGuard } from "./device-auth.guard";

@Controller('terminal')
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}
    @Post('activate') 
    activate(@Body() dto: ActivateTerminalDto) {
        return this.terminalService.activate(dto.code);
    }
    
    @Get('ping')
    @UseGuards(DeviceAuthGuard) 
    ping() {
      return { ok: true };
    }
        
}



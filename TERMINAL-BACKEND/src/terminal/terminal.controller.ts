import { Body, Post, Controller } from "@nestjs/common";
import { TerminalService } from "./terminal.service";
import { ActivateTerminalDto } from "./dto/activate-terminal.dto";

@Controller('terminal')
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}
    @Post('activate') 
    activate(@Body() dto: ActivateTerminalDto) {
        return this.terminalService.activate(dto.code);
    }     
}



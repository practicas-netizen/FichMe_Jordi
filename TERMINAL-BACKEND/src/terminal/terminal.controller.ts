import { Body, Post, Controller } from "@nestjs/common";
import { TerminalService } from "./terminal.service";

@Controller('terminal')
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}
    @Post('activate') 
    activate(@Body('code') code: string) {
        return this.terminalService.activate(code);
    }     
}



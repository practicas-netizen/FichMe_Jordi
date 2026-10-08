import { Body, Post, Controller, Get, UseGuards, Patch, HttpCode } from "@nestjs/common";
import { TerminalService } from "./terminal.service";
import { ActivateTerminalDto } from "./dto/activate-terminal.dto";
import { DeviceAuthGuard } from "./device-auth.guard";
import { CurrentDevice } from './current-device.decorator';
import { TerminalDevice } from './terminal-device.entity';
import { ApiBearerAuth } from "@nestjs/swagger";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { SetAdminPinDto } from "./dto/set-admin-pin.dto";
import { VerifyAdminPinDto } from "./dto/verify-admin-pin.dto";

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

    @Get('settings')
    @ApiBearerAuth()
    @UseGuards(DeviceAuthGuard)
    getSettings(@CurrentDevice() device: TerminalDevice) {
      return this.terminalService.getSettings(device.id);
    }

    @Patch('settings')
    @ApiBearerAuth()
    @UseGuards(DeviceAuthGuard)
    updateSettings(
      @CurrentDevice() device: TerminalDevice,
      @Body() dto: UpdateSettingsDto,
    ) {
      return this.terminalService.updateSettings(device.id, dto);
    }
    
    @Post('admin-pin')
    @ApiBearerAuth()
    @UseGuards(DeviceAuthGuard)
    setAdminPin(@CurrentDevice() device: TerminalDevice, @Body() dto: SetAdminPinDto) {
      return this.terminalService.setAdminPin(device.id, dto);
    }

    @Post('admin-pin/verify')
    @HttpCode(200)
    @ApiBearerAuth()
    @UseGuards(DeviceAuthGuard)
    verifyAdminPin(@CurrentDevice() device: TerminalDevice, @Body() dto: VerifyAdminPinDto) {
      return this.terminalService.verifyAdminPin(device.id, dto.pin);
    }
}



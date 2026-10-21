import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivationCode } from "../terminal/activation-code.entity";
import { TerminalDevice } from "../terminal/terminal-device.entity";
import { CompaniesModule } from "../companies/companies.module";
import { TabletsService } from "./tablets.service";
import { TabletsAdminController } from "./tablets-admin.controller";


@Module({
    imports: [TypeOrmModule.forFeature([ActivationCode, TerminalDevice]), CompaniesModule],
    controllers: [TabletsAdminController],
    providers: [TabletsService],
})
export class TabletsModule {}
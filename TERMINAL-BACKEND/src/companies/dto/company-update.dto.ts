import { PartialType } from "@nestjs/swagger";
import { CompanyCreateDto } from "./company-create.dto";

// Mismos campos y validaciones que al crear, pero todos opcionales
export class CompanyUpdateDto extends PartialType(CompanyCreateDto) {}
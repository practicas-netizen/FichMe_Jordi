import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Companies } from './companies.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Companies])],
})
export class CompaniesModule {}
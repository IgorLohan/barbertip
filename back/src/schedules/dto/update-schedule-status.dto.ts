import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ScheduleStatus } from '../../common/enums/schedule-status.enum';

export class UpdateScheduleStatusDto {
  @ApiProperty({ enum: ScheduleStatus, example: ScheduleStatus.CONFIRMADO })
  @IsEnum(ScheduleStatus)
  @IsNotEmpty()
  status: ScheduleStatus;
}

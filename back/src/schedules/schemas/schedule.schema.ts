import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ScheduleStatus } from '../../common/enums/schedule-status.enum';

export type ScheduleDocument = Schedule & Document;

@Schema({ timestamps: true })
export class Schedule {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  clientId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Barber', required: true })
  barberId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: true })
  serviceId: string;

  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;

  @Prop({ required: true, enum: ScheduleStatus, default: ScheduleStatus.AGENDADO })
  status: ScheduleStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

ScheduleSchema.index({ barberId: 1, startAt: 1, endAt: 1 });
ScheduleSchema.index({ clientId: 1 });
ScheduleSchema.index({ companyId: 1 });

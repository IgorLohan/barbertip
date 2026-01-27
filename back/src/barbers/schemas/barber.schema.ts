import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BarberDocument = Barber & Document;

@Schema({ timestamps: true })
export class Barber {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Service' }], default: [] })
  serviceIds: string[];

  @Prop({
    type: [
      {
        dayOfWeek: { type: Number, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],
    default: [],
  })
  workingHours: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: string;

  @Prop({ default: true })
  active: boolean;
}

export const BarberSchema = SchemaFactory.createForClass(Barber);

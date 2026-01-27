import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  address?: string;

  @Prop()
  phone?: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Number, default: 0 })
  monthlyFee?: number;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

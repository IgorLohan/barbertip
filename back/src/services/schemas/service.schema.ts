import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ServiceDocument = Service & Document;

/**
 * Serviço interno que uma empresa oferece ao cliente (ex.: Corte de cabelo, Barba).
 * Usado em /v1/service (singular). Independe do tipo de estabelecimento (EstablishmentType).
 */
@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: string;

  @Prop({ default: true })
  active: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EstablishmentTypeDocument = EstablishmentType & Document;

/**
 * Tipo de estabelecimento (ex.: Unhas, Cabelos, Barbearia, Depilação, Maquiagem, etc.).
 * Usado em /v1/service-companies.
 */
@Schema({ timestamps: true })
export class EstablishmentType {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: true })
  active: boolean;
}

export const EstablishmentTypeSchema =
  SchemaFactory.createForClass(EstablishmentType);

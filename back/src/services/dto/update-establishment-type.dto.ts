import { PartialType } from '@nestjs/swagger';
import { CreateEstablishmentTypeDto } from './create-establishment-type.dto';

export class UpdateEstablishmentTypeDto extends PartialType(
  CreateEstablishmentTypeDto,
) {}

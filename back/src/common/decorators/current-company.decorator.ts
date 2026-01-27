import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

export const CurrentCompany = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // ADMIN pode ver tudo de todos, então retorna null para não filtrar por companyId
    if (request.user?.role === UserRole.ADMIN) {
      return null;
    }
    return request.user?.companyId;
  },
);

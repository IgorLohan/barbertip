import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentCompany } from '../common/decorators/current-company.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar novo usuário' })
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentCompany() companyId: string | null,
    @CurrentUser() user: any,
  ) {
    // ADMIN pode criar usuários para qualquer empresa, então usa o companyId do DTO se fornecido
    // Caso contrário, usa o companyId do usuário logado (ou null se ADMIN)
    const finalCompanyId = createUserDto.companyId || companyId || user.companyId;
    return this.usersService.create({ ...createUserDto, companyId: finalCompanyId } as any);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuários da empresa' })
  findAll(@CurrentCompany() companyId: string | null) {
    return this.usersService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover usuário (exclusão definitiva)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

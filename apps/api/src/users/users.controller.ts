import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantId } from '../common/decorators/tenant.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto, @TenantId() tenantId: string) {
    const user = await this.usersService.create(createUserDto, tenantId);
    return {
      data: user,
      message: 'User created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (paginated)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(
    @Query() query: UserQueryDto,
    @TenantId() tenantId: string,
    @Req() req: any,
  ) {
    const result = await this.usersService.findAll(query, tenantId, req.user);
    return {
      data: result.users,
      meta: {
        pagination: result.pagination,
        total: result.total,
      },
      message: 'Users retrieved successfully',
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Req() req: any) {
    return {
      data: req.user,
      message: 'Profile retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    const user = await this.usersService.findOne(id, tenantId);
    return {
      data: user,
      message: 'User retrieved successfully',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @TenantId() tenantId: string,
    @Req() req: any,
  ) {
    const user = await this.usersService.update(id, updateUserDto, tenantId, req.user);
    return {
      data: user,
      message: 'User updated successfully',
    };
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.usersService.remove(id, tenantId);
    return {
      message: 'User deleted successfully',
    };
  }

  @Post(':id/activate')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  async activate(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.usersService.changeStatus(id, 'ACTIVE', tenantId);
    return {
      message: 'User activated successfully',
    };
  }

  @Post(':id/deactivate')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  async deactivate(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.usersService.changeStatus(id, 'INACTIVE', tenantId);
    return {
      message: 'User deactivated successfully',
    };
  }

  @Post(':id/reset-password')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Param('id') id: string, @TenantId() tenantId: string) {
    const tempPassword = await this.usersService.resetPassword(id, tenantId);
    return {
      data: { temporaryPassword: tempPassword },
      message: 'Password reset successfully',
    };
  }

  @Get('stats/overview')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get users statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@TenantId() tenantId: string) {
    const stats = await this.usersService.getStats(tenantId);
    return {
      data: stats,
      message: 'Statistics retrieved successfully',
    };
  }
}
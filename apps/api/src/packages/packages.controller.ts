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
import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdatePackageDto, PackageQueryDto } from './dto/package.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantId } from '../common/decorators/tenant.decorator';

@ApiTags('packages')
@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new package' })
  @ApiResponse({ status: 201, description: 'Package created successfully' })
  async create(@Body() createPackageDto: CreatePackageDto, @TenantId() tenantId: string) {
    const packageData = await this.packagesService.create(createPackageDto, tenantId);
    return {
      data: packageData,
      message: 'Package created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all packages (paginated)' })
  @ApiResponse({ status: 200, description: 'Packages retrieved successfully' })
  async findAll(
    @Query() query: PackageQueryDto,
    @TenantId() tenantId: string,
    @Req() req: any,
  ) {
    const result = await this.packagesService.findAll(query, tenantId, req.user);
    return {
      data: result.packages,
      meta: {
        pagination: result.pagination,
        total: result.total,
      },
      message: 'Packages retrieved successfully',
    };
  }

  @Get('published')
  @ApiOperation({ summary: 'Get published packages for public view' })
  @ApiResponse({ status: 200, description: 'Published packages retrieved successfully' })
  async findPublished(@TenantId() tenantId: string) {
    const packages = await this.packagesService.findPublished(tenantId);
    return {
      data: packages,
      message: 'Published packages retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package by ID' })
  @ApiResponse({ status: 200, description: 'Package retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    const packageData = await this.packagesService.findOne(id, tenantId);
    return {
      data: packageData,
      message: 'Package retrieved successfully',
    };
  }

  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update package' })
  @ApiResponse({ status: 200, description: 'Package updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
    @TenantId() tenantId: string,
  ) {
    const packageData = await this.packagesService.update(id, updatePackageDto, tenantId);
    return {
      data: packageData,
      message: 'Package updated successfully',
    };
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete package (soft delete)' })
  @ApiResponse({ status: 200, description: 'Package deleted successfully' })
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.packagesService.remove(id, tenantId);
    return {
      message: 'Package deleted successfully',
    };
  }

  @Post(':id/publish')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish package' })
  @ApiResponse({ status: 200, description: 'Package published successfully' })
  async publish(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.packagesService.changeStatus(id, 'PUBLISHED', tenantId);
    return {
      message: 'Package published successfully',
    };
  }

  @Post(':id/unpublish')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish package' })
  @ApiResponse({ status: 200, description: 'Package unpublished successfully' })
  async unpublish(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.packagesService.changeStatus(id, 'DRAFT', tenantId);
    return {
      message: 'Package unpublished successfully',
    };
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Check package availability' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  async checkAvailability(@Param('id') id: string, @TenantId() tenantId: string) {
    const availability = await this.packagesService.checkAvailability(id, tenantId);
    return {
      data: availability,
      message: 'Package availability checked successfully',
    };
  }

  @Get('stats/overview')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get packages statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@TenantId() tenantId: string) {
    const stats = await this.packagesService.getStats(tenantId);
    return {
      data: stats,
      message: 'Statistics retrieved successfully',
    };
  }

  @Post('duplicate/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Duplicate existing package' })
  @ApiResponse({ status: 201, description: 'Package duplicated successfully' })
  async duplicate(@Param('id') id: string, @TenantId() tenantId: string) {
    const packageData = await this.packagesService.duplicate(id, tenantId);
    return {
      data: packageData,
      message: 'Package duplicated successfully',
    };
  }

  @Get('export/excel')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({ summary: 'Export packages to Excel' })
  @ApiResponse({ status: 200, description: 'Packages exported successfully' })
  async exportToExcel(@TenantId() tenantId: string, @Query() query: PackageQueryDto) {
    const excelBuffer = await this.packagesService.exportToExcel(query, tenantId);
    return {
      data: excelBuffer,
      message: 'Packages exported successfully',
    };
  }
}
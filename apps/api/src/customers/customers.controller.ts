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
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantId } from '../common/decorators/tenant.decorator';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SALES, UserRole.OPERATION)
  @ApiOperation({ summary: 'Create new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  async create(@Body() createCustomerDto: CreateCustomerDto, @TenantId() tenantId: string) {
    const customer = await this.customersService.create(createCustomerDto, tenantId);
    return {
      data: customer,
      message: 'Customer created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers (paginated)' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async findAll(
    @Query() query: CustomerQueryDto,
    @TenantId() tenantId: string,
    @Req() req: any,
  ) {
    const result = await this.customersService.findAll(query, tenantId, req.user);
    return {
      data: result.customers,
      meta: {
        pagination: result.pagination,
        total: result.total,
      },
      message: 'Customers retrieved successfully',
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search customers by name, email, phone, or ID' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
    @TenantId() tenantId: string,
  ) {
    const customers = await this.customersService.search(query, limit, tenantId);
    return {
      data: customers,
      message: 'Search results retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    const customer = await this.customersService.findOne(id, tenantId);
    return {
      data: customer,
      message: 'Customer retrieved successfully',
    };
  }

  @Get(':id/bookings')
  @ApiOperation({ summary: 'Get customer booking history' })
  @ApiResponse({ status: 200, description: 'Booking history retrieved successfully' })
  async getBookingHistory(
    @Param('id') id: string,
    @Query() query: any,
    @TenantId() tenantId: string,
  ) {
    const result = await this.customersService.getBookingHistory(id, query, tenantId);
    return {
      data: result.bookings,
      meta: {
        pagination: result.pagination,
        total: result.total,
      },
      message: 'Booking history retrieved successfully',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @TenantId() tenantId: string,
    @Req() req: any,
  ) {
    const customer = await this.customersService.update(id, updateCustomerDto, tenantId, req.user);
    return {
      data: customer,
      message: 'Customer updated successfully',
    };
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete customer (soft delete)' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.customersService.remove(id, tenantId);
    return {
      message: 'Customer deleted successfully',
    };
  }

  @Post('import')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SALES)
  @ApiOperation({ summary: 'Import customers from CSV/Excel' })
  @ApiResponse({ status: 201, description: 'Customers imported successfully' })
  async import(@Body() importData: { customers: any[] }, @TenantId() tenantId: string) {
    const result = await this.customersService.importCustomers(importData.customers, tenantId);
    return {
      data: result,
      message: 'Customers imported successfully',
    };
  }

  @Get('export/excel')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SALES, UserRole.FINANCE)
  @ApiOperation({ summary: 'Export customers to Excel' })
  @ApiResponse({ status: 200, description: 'Customers exported successfully' })
  async exportToExcel(@Query() query: CustomerQueryDto, @TenantId() tenantId: string) {
    const excelBuffer = await this.customersService.exportToExcel(query, tenantId);
    return {
      data: excelBuffer,
      message: 'Customers exported successfully',
    };
  }

  @Get('stats/overview')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SALES, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get customer statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@TenantId() tenantId: string) {
    const stats = await this.customersService.getStats(tenantId);
    return {
      data: stats,
      message: 'Statistics retrieved successfully',
    };
  }

  @Post(':id/merge')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Merge duplicate customers' })
  @ApiResponse({ status: 200, description: 'Customers merged successfully' })
  async merge(
    @Param('id') primaryId: string,
    @Body() body: { duplicateId: string },
    @TenantId() tenantId: string,
  ) {
    const customer = await this.customersService.mergeCustomers(primaryId, body.duplicateId, tenantId);
    return {
      data: customer,
      message: 'Customers merged successfully',
    };
  }

  @Get('duplicates/find')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Find potential duplicate customers' })
  @ApiResponse({ status: 200, description: 'Potential duplicates found' })
  async findDuplicates(@TenantId() tenantId: string) {
    const duplicates = await this.customersService.findDuplicates(tenantId);
    return {
      data: duplicates,
      message: 'Potential duplicates retrieved successfully',
    };
  }
}
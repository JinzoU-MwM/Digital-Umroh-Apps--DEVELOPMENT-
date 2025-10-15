import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    const invoice = await this.invoicesService.create(createInvoiceDto, req.user.tenantId);
    return {
      success: true,
      data: invoice,
      message: 'Invoice created successfully',
    };
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get all invoices with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async findAll(@Query() query: InvoiceQueryDto, @Request() req) {
    const result = await this.invoicesService.findAll(query, req.user.tenantId, req.user);
    return {
      success: true,
      data: result,
      message: 'Invoices retrieved successfully',
    };
  }

  @Get('stats/overview')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get invoices statistics overview' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req) {
    const stats = await this.invoicesService.getStats(req.user.tenantId);
    return {
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully',
    };
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    const invoice = await this.invoicesService.findOne(id, req.user.tenantId);
    return {
      success: true,
      data: invoice,
      message: 'Invoice retrieved successfully',
    };
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Invoice cannot be updated' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req,
  ) {
    const invoice = await this.invoicesService.update(id, updateInvoiceDto, req.user.tenantId, req.user);
    return {
      success: true,
      data: invoice,
      message: 'Invoice updated successfully',
    };
  }

  @Post(':id/send')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Send invoice to customer' })
  @ApiResponse({ status: 200, description: 'Invoice sent successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Invoice cannot be sent' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  async sendInvoice(@Param('id') id: string, @Request() req) {
    const invoice = await this.invoicesService.sendInvoice(id, req.user.tenantId);
    return {
      success: true,
      data: invoice,
      message: 'Invoice sent successfully',
    };
  }

  @Post(':id/cancel')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Invoice cannot be cancelled' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string, @Request() req) {
    const invoice = await this.invoicesService.cancel(id, req.user.tenantId);
    return {
      success: true,
      data: invoice,
      message: 'Invoice cancelled successfully',
    };
  }
}
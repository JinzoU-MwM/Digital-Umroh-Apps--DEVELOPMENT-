import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dto/customer.dto';
import { UserRole } from '@prisma/client';
import * as ExcelJS from 'exceljs';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto, tenantId: string) {
    const { id_number, email, phone } = createCustomerDto;

    // Check if customer already exists in tenant by ID number
    const existingCustomerById = await this.prisma.customer.findFirst({
      where: {
        tenant_id: tenantId,
        id_number,
        deleted_at: null,
      },
    });

    if (existingCustomerById) {
      throw new ConflictException('Customer with this ID number already exists');
    }

    // Check for duplicate email if provided
    if (email) {
      const existingCustomerByEmail = await this.prisma.customer.findFirst({
        where: {
          tenant_id: tenantId,
          email,
          deleted_at: null,
        },
      });

      if (existingCustomerByEmail) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    // Check for duplicate phone
    const existingCustomerByPhone = await this.prisma.customer.findFirst({
      where: {
        tenant_id: tenantId,
        phone,
        deleted_at: null,
      },
    });

    if (existingCustomerByPhone) {
      throw new ConflictException('Customer with this phone number already exists');
    }

    // Create customer
    const customer = await this.prisma.withTenant(tenantId, async () => {
      return this.prisma.customer.create({
        data: {
          name: createCustomerDto.name,
          email: createCustomerDto.email,
          phone: createCustomerDto.phone,
          address: createCustomerDto.address ? JSON.parse(JSON.stringify(createCustomerDto.address)) : null,
          id_type: createCustomerDto.id_type,
          id_number: createCustomerDto.id_number,
          birth_date: new Date(createCustomerDto.birth_date),
          gender: createCustomerDto.gender,
          nationality: createCustomerDto.nationality,
          company: createCustomerDto.company,
          notes: createCustomerDto.notes,
          tenant_id: tenantId,
        },
      });
    });

    return customer;
  }

  async findAll(query: CustomerQueryDto, tenantId: string, currentUser: any) {
    const {
      page = 1,
      limit = 20,
      search,
      gender,
      nationality,
      company,
      created_from,
      created_to,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deleted_at: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { id_number: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (gender) {
      where.gender = gender;
    }

    if (nationality) {
      where.nationality = nationality;
    }

    if (company) {
      where.company = company;
    }

    if (created_from || created_to) {
      where.created_at = {};
      if (created_from) {
        where.created_at.gte = new Date(created_from);
      }
      if (created_to) {
        where.created_at.lte = new Date(created_to);
      }
    }

    // Get total count
    const total = await this.prisma.customer.count({ where });

    // Get customers with pagination
    const customers = await this.prisma.customer.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return {
      customers,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async search(query: string, limit: number, tenantId: string) {
    return this.prisma.customer.findMany({
      where: {
        deleted_at: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { id_number: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        _count: {
          select: {
            bookings: true,
            pilgrims: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async getBookingHistory(id: string, query: any, tenantId: string) {
    const { page = 1, limit = 10, status } = query;
    const offset = (page - 1) * limit;

    // Verify customer exists
    const customer = await this.prisma.customer.findFirst({
      where: { id, deleted_at: null },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Build where clause for bookings
    const where: any = {
      customer_id: id,
      deleted_at: null,
    };

    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await this.prisma.booking.count({ where });

    // Get bookings
    const bookings = await this.prisma.booking.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        package: {
          select: {
            id: true,
            name: true,
            code: true,
            period_from: true,
            period_to: true,
          },
        },
        _count: {
          select: { pilgrims: true },
        },
      },
    });

    return {
      bookings,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, tenantId: string, currentUser: any) {
    // Check if customer exists
    const existingCustomer = await this.prisma.customer.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!existingCustomer) {
      throw new NotFoundException('Customer not found');
    }

    // Check for conflicts if updating unique fields
    const { email, phone, id_number } = updateCustomerDto;

    if (email && email !== existingCustomer.email) {
      const conflict = await this.prisma.customer.findFirst({
        where: {
          tenant_id: tenantId,
          email,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (conflict) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    if (phone && phone !== existingCustomer.phone) {
      const conflict = await this.prisma.customer.findFirst({
        where: {
          tenant_id: tenantId,
          phone,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (conflict) {
        throw new ConflictException('Customer with this phone number already exists');
      }
    }

    if (id_number && id_number !== existingCustomer.id_number) {
      const conflict = await this.prisma.customer.findFirst({
        where: {
          tenant_id: tenantId,
          id_number,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (conflict) {
        throw new ConflictException('Customer with this ID number already exists');
      }
    }

    // Update customer
    const customer = await this.prisma.withTenant(tenantId, async () => {
      return this.prisma.customer.update({
        where: { id },
        data: {
          name: updateCustomerDto.name,
          email: updateCustomerDto.email,
          phone: updateCustomerDto.phone,
          address: updateCustomerDto.address ? JSON.parse(JSON.stringify(updateCustomerDto.address)) : undefined,
          id_type: updateCustomerDto.id_type,
          id_number: updateCustomerDto.id_number,
          birth_date: updateCustomerDto.birth_date ? new Date(updateCustomerDto.birth_date) : undefined,
          gender: updateCustomerDto.gender,
          nationality: updateCustomerDto.nationality,
          company: updateCustomerDto.company,
          notes: updateCustomerDto.notes,
        },
      });
    });

    return customer;
  }

  async remove(id: string, tenantId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if customer has active bookings
    const activeBookings = await this.prisma.booking.count({
      where: {
        customer_id: id,
        status: { in: ['PENDING', 'CONFIRMED', 'PAID'] },
        deleted_at: null,
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException('Cannot delete customer with active bookings');
    }

    // Soft delete
    await this.prisma.customer.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async importCustomers(customersData: any[], tenantId: string) {
    const results = {
      imported: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const customerData of customersData) {
      try {
        // Validate required fields
        if (!customerData.name || !customerData.phone || !customerData.id_number) {
          results.failed++;
          results.errors.push(`Missing required fields for ${customerData.name || 'unknown'}`);
          continue;
        }

        // Check if customer already exists
        const existingCustomer = await this.prisma.customer.findFirst({
          where: {
            tenant_id: tenantId,
            id_number: customerData.id_number,
            deleted_at: null,
          },
        });

        if (existingCustomer) {
          results.failed++;
          results.errors.push(`Customer with ID ${customerData.id_number} already exists`);
          continue;
        }

        // Create customer
        await this.prisma.customer.create({
          data: {
            tenant_id: tenantId,
            name: customerData.name,
            email: customerData.email || null,
            phone: customerData.phone,
            id_type: customerData.id_type || 'KTP',
            id_number: customerData.id_number,
            birth_date: customerData.birth_date ? new Date(customerData.birth_date) : null,
            gender: customerData.gender || 'MALE',
            nationality: customerData.nationality || 'Indonesia',
            company: customerData.company || null,
            address: customerData.address || null,
            notes: customerData.notes || null,
          },
        });

        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to import ${customerData.name}: ${error.message}`);
      }
    }

    return results;
  }

  async exportToExcel(query: CustomerQueryDto, tenantId: string) {
    const { customers } = await this.findAll(
      { ...query, limit: 10000 }, // Large limit for export
      tenantId,
      null,
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customers');

    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'ID Type', key: 'id_type', width: 15 },
      { header: 'ID Number', key: 'id_number', width: 20 },
      { header: 'Birth Date', key: 'birth_date', width: 15 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Nationality', key: 'nationality', width: 15 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Created At', key: 'created_at', width: 20 },
    ];

    // Add data
    customers.forEach((customer) => {
      worksheet.addRow({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        id_type: customer.id_type,
        id_number: customer.id_number,
        birth_date: customer.birth_date?.toISOString().split('T')[0] || '',
        gender: customer.gender,
        nationality: customer.nationality,
        company: customer.company || '',
        created_at: customer.created_at.toISOString().split('T')[0],
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async getStats(tenantId: string) {
    const [
      totalCustomers,
      customersByGender,
      customersByNationality,
      recentCustomers,
      topCompanies,
    ] = await Promise.all([
      this.prisma.customer.count({
        where: { deleted_at: null },
      }),
      this.prisma.customer.groupBy({
        by: ['gender'],
        where: { deleted_at: null },
        _count: { gender: true },
      }),
      this.prisma.customer.groupBy({
        by: ['nationality'],
        where: { deleted_at: null },
        _count: { nationality: true },
      }),
      this.prisma.customer.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
          deleted_at: null,
        },
      }),
      this.prisma.customer.groupBy({
        by: ['company'],
        where: {
          company: { not: null },
          deleted_at: null,
        },
        _count: { company: true },
        orderBy: { _count: { company: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      total: totalCustomers,
      byGender: customersByGender.map(item => ({
        gender: item.gender,
        count: item._count.gender,
      })),
      byNationality: customersByNationality.map(item => ({
        nationality: item.nationality,
        count: item._count.nationality,
      })),
      recentCount: recentCustomers,
      topCompanies: topCompanies.map(item => ({
        company: item.company,
        count: item._count.company,
      })),
    };
  }

  async mergeCustomers(primaryId: string, duplicateId: string, tenantId: string) {
    // Verify both customers exist
    const primaryCustomer = await this.prisma.customer.findFirst({
      where: { id: primaryId, deleted_at: null },
    });

    const duplicateCustomer = await this.prisma.customer.findFirst({
      where: { id: duplicateId, deleted_at: null },
    });

    if (!primaryCustomer || !duplicateCustomer) {
      throw new NotFoundException('One or both customers not found');
    }

    // Get all related records
    const [bookings, pilgrims] = await Promise.all([
      this.prisma.booking.findMany({
        where: { customer_id: duplicateId, deleted_at: null },
      }),
      this.prisma.pilgrim.findMany({
        where: { customer_id: duplicateId, deleted_at: null },
      }),
    ]);

    // Update all related records to point to primary customer
    await Promise.all([
      ...bookings.map(booking =>
        this.prisma.booking.update({
          where: { id: booking.id },
          data: { customer_id: primaryId },
        })
      ),
      ...pilgrims.map(pilgrim =>
        this.prisma.pilgrim.update({
          where: { id: pilgrim.id },
          data: { customer_id: primaryId },
        })
      ),
    ]);

    // Merge customer data (keep most recent complete data)
    const mergedData = {
      name: primaryCustomer.name || duplicateCustomer.name,
      email: primaryCustomer.email || duplicateCustomer.email,
      phone: primaryCustomer.phone || duplicateCustomer.phone,
      address: primaryCustomer.address || duplicateCustomer.address,
      notes: `${primaryCustomer.notes || ''}\n\n--- Merged from duplicate ---\n${duplicateCustomer.notes || ''}`,
      updated_at: new Date(),
    };

    const updatedCustomer = await this.prisma.customer.update({
      where: { id: primaryId },
      data: mergedData,
    });

    // Soft delete duplicate customer
    await this.prisma.customer.update({
      where: { id: duplicateId },
      data: {
        deleted_at: new Date(),
        notes: `MERGED into ${primaryId}. Original: ${duplicateCustomer.notes || ''}`,
      },
    });

    return updatedCustomer;
  }

  async findDuplicates(tenantId: string) {
    // Find potential duplicates based on phone number or ID number
    const phoneGroups = await this.prisma.customer.groupBy({
      by: ['phone'],
      where: {
        phone: { not: null },
        deleted_at: null,
      },
      having: {
        phone: {
          _count: { gt: 1 },
        },
      },
      _count: { phone: true },
    });

    const idNumberGroups = await this.prisma.customer.groupBy({
      by: ['id_number'],
      where: {
        deleted_at: null,
      },
      having: {
        id_number: {
          _count: { gt: 1 },
        },
      },
      _count: { id_number: true },
    });

    // Get actual duplicate records
    const phoneDuplicates = await Promise.all(
      phoneGroups.map(async group => {
        const customers = await this.prisma.customer.findMany({
          where: { phone: group.phone, deleted_at: null },
          select: { id: true, name: true, phone: true, email: true, created_at: true },
        });
        return customers.length > 1 ? customers : null;
      })
    );

    const idDuplicates = await Promise.all(
      idNumberGroups.map(async group => {
        const customers = await this.prisma.customer.findMany({
          where: { id_number: group.id_number, deleted_at: null },
          select: { id: true, name: true, id_number: true, email: true, created_at: true },
        });
        return customers.length > 1 ? customers : null;
      })
    );

    return {
      phoneDuplicates: phoneDuplicates.filter(Boolean),
      idNumberDuplicates: idDuplicates.filter(Boolean),
    };
  }
}
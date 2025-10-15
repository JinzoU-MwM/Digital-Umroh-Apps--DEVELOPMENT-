import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePackageDto, UpdatePackageDto, PackageQueryDto } from './dto/package.dto';
import { PackageStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPackageDto: CreatePackageDto, tenantId: string) {
    const { code, quota, period_from, period_to } = createPackageDto;

    // Check if package code already exists in tenant
    const existingPackage = await this.prisma.package.findFirst({
      where: {
        tenant_id: tenantId,
        code,
        deleted_at: null,
      },
    });

    if (existingPackage) {
      throw new ConflictException('Package with this code already exists');
    }

    // Validate dates
    if (new Date(period_from) >= new Date(period_to)) {
      throw new BadRequestException('Period from must be before period to');
    }

    // Create package
    const packageData = await this.prisma.package.create({
      data: {
        name: createPackageDto.name,
        code: createPackageDto.code,
        type: createPackageDto.type,
        description: createPackageDto.description,
        period_from: new Date(period_from),
        period_to: new Date(period_to),
        quota: createPackageDto.quota,
        hotels: createPackageDto.hotels ? JSON.parse(JSON.stringify(createPackageDto.hotels)) : [],
        flights: createPackageDto.flights ? JSON.parse(JSON.stringify(createPackageDto.flights)) : [],
        itinerary: createPackageDto.itinerary ? JSON.parse(JSON.stringify(createPackageDto.itinerary)) : [],
        price_quad: createPackageDto.price_quad.amount,
        price_triple: createPackageDto.price_triple.amount,
        price_double: createPackageDto.price_double.amount,
        price_single: createPackageDto.price_single.amount,
        inclusions: createPackageDto.inclusions,
        exclusions: createPackageDto.exclusions,
        terms: createPackageDto.terms,
        notes: createPackageDto.notes,
        featured_image_url: createPackageDto.featured_image_url,
        gallery_images: createPackageDto.gallery_images,
        documents_required: createPackageDto.documents_required,
        status: PackageStatus.DRAFT,
        tenant: {
          connect: { id: tenantId }
        }
      },
    });

    return packageData;
  }

  async findAll(query: PackageQueryDto, tenantId: string, currentUser: any) {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      status,
      price_min,
      price_max,
      period_from,
      period_to,
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
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (price_min || price_max) {
      where.OR = [
        { price_quad: { gte: price_min || 0, lte: price_max || 999999999 } },
        { price_triple: { gte: price_min || 0, lte: price_max || 999999999 } },
        { price_double: { gte: price_min || 0, lte: price_max || 999999999 } },
        { price_single: { gte: price_min || 0, lte: price_max || 999999999 } },
      ];
    }

    if (period_from || period_to) {
      where.AND = [];
      if (period_from) {
        where.AND.push({ period_from: { gte: new Date(period_from) } });
      }
      if (period_to) {
        where.AND.push({ period_to: { lte: new Date(period_to) } });
      }
    }

    // Get total count
    const total = await this.prisma.package.count({ where });

    // Get packages with pagination
    const packages = await this.prisma.package.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return {
      packages,
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

  async findPublished(tenantId: string) {
    return this.prisma.package.findMany({
      where: {
        status: PackageStatus.PUBLISHED,
        deleted_at: null,
        period_from: { lte: new Date() },
        period_to: { gte: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const packageData = await this.prisma.package.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!packageData) {
      throw new NotFoundException('Package not found');
    }

    return packageData;
  }

  async update(id: string, updatePackageDto: UpdatePackageDto, tenantId: string) {
    // Check if package exists
    const existingPackage = await this.prisma.package.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!existingPackage) {
      throw new NotFoundException('Package not found');
    }

    // Check if package code conflicts with existing one
    if (updatePackageDto.code) {
      const conflictingPackage = await this.prisma.package.findFirst({
        where: {
          tenant_id: tenantId,
          code: updatePackageDto.code,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (conflictingPackage) {
        throw new ConflictException('Package with this code already exists');
      }
    }

    // Validate dates if provided
    const { period_from, period_to } = updatePackageDto;
    if (period_from && period_to && new Date(period_from) >= new Date(period_to)) {
      throw new BadRequestException('Period from must be before period to');
    }

    // Update package
    const packageData = await this.prisma.package.update({
      where: { id },
      data: {
        name: updatePackageDto.name,
        code: updatePackageDto.code,
        type: updatePackageDto.type,
        description: updatePackageDto.description,
        ...(period_from && { period_from: new Date(period_from) }),
        ...(period_to && { period_to: new Date(period_to) }),
        quota: updatePackageDto.quota,
        hotels: updatePackageDto.hotels ? JSON.parse(JSON.stringify(updatePackageDto.hotels)) : undefined,
        flights: updatePackageDto.flights ? JSON.parse(JSON.stringify(updatePackageDto.flights)) : undefined,
        itinerary: updatePackageDto.itinerary ? JSON.parse(JSON.stringify(updatePackageDto.itinerary)) : undefined,
        price_quad: updatePackageDto.price_quad?.amount,
        price_triple: updatePackageDto.price_triple?.amount,
        price_double: updatePackageDto.price_double?.amount,
        price_single: updatePackageDto.price_single?.amount,
        inclusions: updatePackageDto.inclusions,
        exclusions: updatePackageDto.exclusions,
        terms: updatePackageDto.terms,
        notes: updatePackageDto.notes,
        featured_image_url: updatePackageDto.featured_image_url,
        gallery_images: updatePackageDto.gallery_images,
        documents_required: updatePackageDto.documents_required,
      },
    });

    return packageData;
  }

  async remove(id: string, tenantId: string) {
    const packageData = await this.prisma.package.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!packageData) {
      throw new NotFoundException('Package not found');
    }

    // Check if package has active bookings
    const activeBookings = await this.prisma.booking.count({
      where: {
        package_id: id,
        status: { in: ['PENDING', 'CONFIRMED', 'PAID'] },
        deleted_at: null,
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException('Cannot delete package with active bookings');
    }

    // Soft delete
    await this.prisma.package.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async changeStatus(id: string, status: PackageStatus, tenantId: string) {
    const packageData = await this.prisma.package.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!packageData) {
      throw new NotFoundException('Package not found');
    }

    await this.prisma.package.update({
      where: { id },
      data: { status },
    });
  }

  async checkAvailability(id: string, tenantId: string) {
    const packageData = await this.prisma.package.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!packageData) {
      throw new NotFoundException('Package not found');
    }

    const bookedCount = packageData._count.bookings;
    const available = packageData.quota - bookedCount;
    const isFullyBooked = available <= 0;

    return {
      quota: packageData.quota,
      booked: bookedCount,
      available: Math.max(0, available),
      isFullyBooked,
      status: isFullyBooked ? 'FULL' : 'AVAILABLE',
      percentageBooked: (bookedCount / packageData.quota) * 100,
    };
  }

  async duplicate(id: string, tenantId: string) {
    const originalPackage = await this.prisma.package.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!originalPackage) {
      throw new NotFoundException('Package not found');
    }

    // Create a copy with new code and name
    const duplicatedPackage = await this.prisma.package.create({
      data: {
        name: `${originalPackage.name} (Copy)`,
        code: `${originalPackage.code}-COPY-${Date.now()}`,
        type: originalPackage.type,
        description: originalPackage.description,
        period_from: originalPackage.period_from,
        period_to: originalPackage.period_to,
        quota: originalPackage.quota,
        hotels: originalPackage.hotels,
        flights: originalPackage.flights,
        itinerary: originalPackage.itinerary,
        price_quad: originalPackage.price_quad,
        price_triple: originalPackage.price_triple,
        price_double: originalPackage.price_double,
        price_single: originalPackage.price_single,
        inclusions: originalPackage.inclusions,
        exclusions: originalPackage.exclusions,
        terms: originalPackage.terms,
        notes: originalPackage.notes,
        featured_image_url: originalPackage.featured_image_url,
        gallery_images: originalPackage.gallery_images,
        documents_required: originalPackage.documents_required,
        status: PackageStatus.DRAFT, // Start as draft
        tenant: {
          connect: { id: tenantId }
        }
      },
    });

    return duplicatedPackage;
  }

  async getStats(tenantId: string) {
    const [
      totalPackages,
      publishedPackages,
      draftPackages,
      fullPackages,
      packagesByType,
      averagePrice,
    ] = await Promise.all([
      this.prisma.package.count({
        where: { deleted_at: null },
      }),
      this.prisma.package.count({
        where: { status: PackageStatus.PUBLISHED, deleted_at: null },
      }),
      this.prisma.package.count({
        where: { status: PackageStatus.DRAFT, deleted_at: null },
      }),
      this.prisma.package.count({
        where: {
          status: PackageStatus.FULL,
          deleted_at: null,
        },
      }),
      this.prisma.package.groupBy({
        by: ['type'],
        where: { deleted_at: null },
        _count: { type: true },
      }),
      this.prisma.package.aggregate({
        where: { deleted_at: null },
        _avg: {
          price_quad: true,
          price_double: true,
        },
      }),
    ]);

    return {
      total: totalPackages,
      published: publishedPackages,
      draft: draftPackages,
      full: fullPackages,
      available: publishedPackages - fullPackages,
      byType: packagesByType.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
      averagePrices: {
        quad: averagePrice._avg.price_quad || 0,
        double: averagePrice._avg.price_double || 0,
      },
    };
  }

  async exportToExcel(query: PackageQueryDto, tenantId: string) {
    const { packages } = await this.findAll(
      { ...query, limit: 10000 }, // Large limit for export
      tenantId,
      null,
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Packages');

    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Code', key: 'code', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Period From', key: 'period_from', width: 20 },
      { header: 'Period To', key: 'period_to', width: 20 },
      { header: 'Quota', key: 'quota', width: 10 },
      { header: 'Price Quad', key: 'price_quad', width: 15 },
      { header: 'Price Triple', key: 'price_triple', width: 15 },
      { header: 'Price Double', key: 'price_double', width: 15 },
      { header: 'Price Single', key: 'price_single', width: 15 },
      { header: 'Created At', key: 'created_at', width: 20 },
    ];

    // Add data
    packages.forEach((pkg) => {
      worksheet.addRow({
        name: pkg.name,
        code: pkg.code,
        type: pkg.type,
        status: pkg.status,
        period_from: pkg.period_from.toISOString().split('T')[0],
        period_to: pkg.period_to.toISOString().split('T')[0],
        quota: pkg.quota,
        price_quad: pkg.price_quad,
        price_triple: pkg.price_triple,
        price_double: pkg.price_double,
        price_single: pkg.price_single,
        created_at: pkg.created_at.toISOString().split('T')[0],
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
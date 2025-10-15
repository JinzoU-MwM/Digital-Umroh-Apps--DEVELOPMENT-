import { PrismaClient, UserRole, TenantPlan, PackageType, PackageStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Travel Umroh',
      slug: 'demo',
      domain: 'demo.appmu.com',
      plan: TenantPlan.STARTER,
      status: 'ACTIVE',
      owner_id: '', // Will be updated after user creation
      contact_email: 'admin@demo.com',
      contact_phone: '+628123456789',
      settings: {
        tax_percentage: 11,
        invoice_number_format: 'INV-{YYYYMM}-{sequence:4}',
        whatsapp_limit_per_minute: 10,
        storage_limit_mb: 1000,
        enable_auto_rooming: false,
        theme_brand_color: '#1e40af',
        feature_flags: {
          multi_airline_manifest: false,
          vendor_po: false,
        },
      },
      limits: {
        users: 5,
        packages: 10,
        bookings_per_month: 100,
        storage_mb: 1000,
        whatsapp_per_day: 50,
      },
    },
  });

  // Create owner user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  const owner = await prisma.user.upsert({
    where: {
      tenant_id_email: {
        tenant_id: tenant.id,
        email: 'admin@demo.com',
      },
    },
    update: {},
    create: {
      tenant_id: tenant.id,
      email: 'admin@demo.com',
      password_hash: hashedPassword,
      name: 'Demo Admin',
      phone: '+628123456789',
      role: UserRole.OWNER,
      status: 'ACTIVE',
      permissions: ['*'], // All permissions
      email_verified_at: new Date(),
    },
  });

  // Update tenant with owner_id
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { owner_id: owner.id },
  });

  // Create sample packages
  const packages = [
    {
      name: 'Umroh Reguler 9 Hari',
      code: 'UMR-REG-001',
      type: PackageType.UMRAH,
      period_from: new Date('2024-03-01'),
      period_to: new Date('2024-03-09'),
      quota: 45,
      price_quad: { amount: 22000000, currency: 'IDR' },
      price_triple: { amount: 24000000, currency: 'IDR' },
      price_double: { amount: 26000000, currency: 'IDR' },
      price_single: { amount: 32000000, currency: 'IDR' },
      status: PackageStatus.PUBLISHED,
      hotels: [
        {
          name: 'Mekkah Tower / Setaraf',
          city: 'Mekkah',
          rating: 4,
          checkin: '2024-03-01T10:00:00Z',
          checkout: '2024-03-05T14:00:00Z',
          room_type: 'Quad',
        },
        {
          name: 'Madinah Anwar / Setaraf',
          city: 'Madinah',
          rating: 4,
          checkin: '2024-03-05T20:00:00Z',
          checkout: '2024-03-08T12:00:00Z',
          room_type: 'Quad',
        },
      ],
      itinerary: [
        {
          day: 1,
          title: 'Keberangkatan dari Jakarta',
          description: 'Berkumpul di Bandara Soekarno-Hatta untuk keberangkatan menuju Jeddah',
          time: '08:00',
          location: 'Bandara Soekarno-Hatta',
        },
        {
          day: 2,
          title: 'Tiba di Jeddah - Menuju Mekkah',
          description: 'Tiba di Jeddah, proses imigrasi, menuju Mekkah untuk check in hotel',
        },
        {
          day: 3,
          title: 'Umroh Pertama',
          description: 'Melaksanakan ibadah umroh pertama (tawaf, sa\'i, tahallul)',
          time: '02:00',
          location: 'Masjidil Haram',
        },
      ],
      inclusions: [
        'Tiket pesawat PP ekonomi',
        'Akomodasi hotel sesuai program',
        'Transportasi bus AC',
        'Makanan menu Indonesia',
        'Muthawif/pembimbing berpengalaman',
        'Ziarah dalam kota Mekkah & Madinah',
        'Visa umroh',
        'Perlengkapan umroh',
      ],
      exclusions: [
        'Biaya pembuatan paspor',
        'Biaya vaksin meningitis',
        'Pengeluaran pribadi',
        'Laundry, telephone, mini bar',
        'Tip untuk pemandu dan supir',
      ],
      documents_required: [
        'Passport asli masih berlaku min 8 bulan',
        'Photo 4x6 (4 lembar background putih)',
        'KTP',
        'Kartu Keluarga',
        'Akte Kelahiran',
        'Buku Nikah (suami-istri)',
        'Vaksin meningitis',
      ],
    },
    {
      name: 'Umroh Plus Turki 12 Hari',
      code: 'UMR-PLUS-001',
      type: PackageType.UMRAH,
      period_from: new Date('2024-04-15'),
      period_to: new Date('2024-04-26'),
      quota: 30,
      price_quad: { amount: 32000000, currency: 'IDR' },
      price_triple: { amount: 35000000, currency: 'IDR' },
      price_double: { amount: 38000000, currency: 'IDR' },
      price_single: { amount: 45000000, currency: 'IDR' },
      status: PackageStatus.PUBLISHED,
      hotels: [
        {
          name: 'Mekkah Hilton / Setaraf',
          city: 'Mekkah',
          rating: 5,
          checkin: '2024-04-16T10:00:00Z',
          checkout: '2024-04-20T14:00:00Z',
          room_type: 'Quad',
        },
        {
          name: 'Madinah Oberoi / Setaraf',
          city: 'Madinah',
          rating: 5,
          checkin: '2024-04-20T20:00:00Z',
          checkout: '2024-04-23T12:00:00Z',
          room_type: 'Quad',
        },
        {
          name: 'Istanbul Crown Plaza / Setaraf',
          city: 'Istanbul',
          rating: 5,
          checkin: '2024-04-23T15:00:00Z',
          checkout: '2024-04-25T12:00:00Z',
          room_type: 'Quad',
        },
      ],
      inclusions: [
        'Tiket pesawat PP ekonomi',
        'Akomodasi hotel bintang 5',
        'Transportasi bus AC',
        'Makanan menu Indonesia & Turki',
        'Muthawif/pembimbing berpengalaman',
        'City tour Istanbul',
        'Ziarah dalam kota Mekkah & Madinah',
        'Visa umroh & visa Turki',
        'Perlengkapan umroh',
      ],
      exclusions: [
        'Biaya pembuatan paspor',
        'Biaya vaksin meningitis',
        'Pengeluaran pribadi',
        'Laundry, telephone, mini bar',
        'Tip untuk pemandu dan supir',
      ],
      documents_required: [
        'Passport asli masih berlaku min 8 bulan',
        'Photo 4x6 (6 lembar background putih)',
        'KTP',
        'Kartu Keluarga',
        'Akte Kelahiran',
        'Buku Nikah (suami-istri)',
        'Vaksin meningitis',
      ],
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: {
        tenant_id_code: {
          tenant_id: tenant.id,
          code: pkg.code,
        },
      },
      update: pkg,
      create: {
        ...pkg,
        tenant_id: tenant.id,
      },
    });
  }

  // Create sample customers
  const customers = [
    {
      name: 'Ahmad Wijaya',
      email: 'ahmad.wijaya@email.com',
      phone: '+6281234567890',
      id_type: 'KTP',
      id_number: '3171051509870001',
      birth_date: new Date('1987-09-15'),
      gender: 'MALE',
      nationality: 'Indonesia',
      address: {
        street: 'Jl. Sudirman No. 123',
        city: 'Jakarta Pusat',
        province: 'DKI Jakarta',
        postal_code: '10210',
      },
    },
    {
      name: 'Siti Nurhaliza',
      email: 'siti.nur@email.com',
      phone: '+6282345678901',
      id_type: 'KTP',
      id_number: '3271062312900002',
      birth_date: new Date('1990-12-23'),
      gender: 'FEMALE',
      nationality: 'Indonesia',
      address: {
        street: 'Jl. Gatot Subroto No. 456',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postal_code: '12190',
      },
    },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: {
        tenant_id_id_number: {
          tenant_id: tenant.id,
          id_number: customer.id_number,
        },
      },
      update: customer,
      create: {
        ...customer,
        tenant_id: tenant.id,
      },
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`👤 Created admin user: admin@demo.com`);
  console.log(`📦 Created ${packages.length} sample packages`);
  console.log(`👥 Created ${customers.length} sample customers`);
  console.log('');
  console.log('🔐 Login credentials:');
  console.log('   Email: admin@demo.com');
  console.log('   Password: Admin123!');
  console.log('   Tenant: demo');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
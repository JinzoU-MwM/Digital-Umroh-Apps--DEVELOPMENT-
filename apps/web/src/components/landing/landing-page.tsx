import Link from 'next/link'
import { ArrowRight, Users, Calendar, CreditCard, Shield, Globe, Headphones } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-emerald-600">Digital Umroh</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="btn btn-primary"
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Platform Manajemen Travel
            <span className="block text-emerald-600">Umrah & Haji Terpadu</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Kelola bisnis travel umrah Anda dengan mudah. Dari pendaftaran jamaah hingga manajemen dokumen,
            semua dalam satu platform yang powerful dan user-friendly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="btn btn-primary text-lg px-8 py-3 inline-flex items-center"
            >
              Mulai Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="btn btn-outline text-lg px-8 py-3"
            >
              Lihat Fitur
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Fitur Lengkap untuk Bisnis Travel Anda
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola travel umrah secara profesional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Users}
              title="Manajemen Jamaah"
              description="Kelola data jamaah, dokumen, dan progres pendaftaran secara real-time"
            />
            <FeatureCard
              icon={Calendar}
              title="Jadwal & Paket"
              description="Buat dan kelola paket umrah dengan jadwal yang fleksibel"
            />
            <FeatureCard
              icon={CreditCard}
              title="Pembayaran Digital"
              description="Terima pembayaran dengan berbagai metode (VA, E-Wallet, Transfer)"
            />
            <FeatureCard
              icon={Shield}
              title="Keamanan Data"
              description="Data jamaah terenkripsi dan tersimpan dengan aman"
            />
            <FeatureCard
              icon={Globe}
              title="Multi-Tenant"
              description="Kelola多个cabang dengan sistem terpisah namun terintegrasi"
            />
            <FeatureCard
              icon={Headphones}
              title="Support 24/7"
              description="Tim support siap membantu Anda kapan saja dibutuhkan"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <StatCard number="500+" label="Travel Terpercaya" />
            <StatCard number="50,000+" label="Jamaah Terlayani" />
            <StatCard number="99.9%" label="Uptime" />
            <StatCard number="24/7" label="Support" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Siap Membawa Bisnis Travel Anda ke Level Berikutnya?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Bergabunglah dengan ratusan travel umrah yang sudah menggunakan Digital Umroh
          </p>
          <Link
            href="/auth/register"
            className="btn btn-primary text-lg px-8 py-3 inline-flex items-center"
          >
            Daftar Sekarang
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Digital Umroh</h3>
              <p className="text-gray-400">
                Platform manajemen travel umrah terpercaya di Indonesia
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Fitur</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Harga</Link></li>
                <li><Link href="/integrations" className="hover:text-white">Integrasi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">Tentang</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Karir</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Bantuan</Link></li>
                <li><Link href="/contact" className="hover:text-white">Kontak</Link></li>
                <li><Link href="/status" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Digital Umroh. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="card p-6 text-center hover:shadow-lg transition-shadow">
      <Icon className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-white mb-2">{number}</div>
      <div className="text-emerald-200">{label}</div>
    </div>
  )
}
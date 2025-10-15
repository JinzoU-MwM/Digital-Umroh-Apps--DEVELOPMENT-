export const QUEUES = {
  NOTIFICATION: 'notifications',
  EMAIL: 'emails',
  REPORT: 'reports',
  PAYMENT: 'payments',
  DOCUMENT_PROCESSING: 'document-processing',
  ROOMING: 'rooming',
  BACKUP: 'backup',
} as const;

export const QUEUE_NAMES = Object.values(QUEUES);

export const {
  NOTIFICATION_QUEUE,
  EMAIL_QUEUE,
  REPORT_QUEUE,
  PAYMENT_QUEUE,
  DOCUMENT_PROCESSING_QUEUE,
  ROOMING_QUEUE,
  BACKUP_QUEUE,
} = QUEUES;

export const JOB_TYPES = {
  // Notification jobs
  SEND_WHATSAPP: 'send-whatsapp',
  SEND_EMAIL: 'send-email',
  SEND_SMS: 'send-sms',
  SEND_PUSH_NOTIFICATION: 'send-push-notification',

  // Report jobs
  GENERATE_BOOKING_REPORT: 'generate-booking-report',
  GENERATE_FINANCIAL_REPORT: 'generate-financial-report',
  GENERATE_PILGRIM_MANIFEST: 'generate-pilgrim-manifest',
  GENERATE_ROOM_ASSIGNMENT: 'generate-room-assignment',

  // Payment jobs
  PROCESS_PAYMENT_WEBHOOK: 'process-payment-webhook',
  RECONCILE_PAYMENTS: 'reconcile-payments',
  SEND_PAYMENT_REMINDER: 'send-payment-reminder',
  CHECK_PAYMENT_TIMEOUT: 'check-payment-timeout',

  // Document processing jobs
  PROCESS_UPLOADED_DOCUMENT: 'process-uploaded-document',
  VERIFY_DOCUMENT_COMPLETENESS: 'verify-document-completeness',
  GENERATE_DOCUMENT_CHECKLIST: 'generate-document-checklist',

  // Rooming jobs
  AUTO_ROOM_ASSIGNMENT: 'auto-room-assignment',
  OPTIMIZE_ROOM_ALLOCATION: 'optimize-room-allocation',

  // Backup jobs
  DAILY_BACKUP: 'daily-backup',
  DATABASE_BACKUP: 'database-backup',
  FILE_BACKUP: 'file-backup',
} as const;

export const NOTIFICATION_TEMPLATES = {
  // Booking notifications
  BOOKING_CONFIRMED: 'booking-confirmed',
  BOOKING_CANCELLED: 'booking-cancelled',
  PAYMENT_RECEIVED: 'payment-received',
  PAYMENT_OVERDUE: 'payment-overdue',

  // Document notifications
  DOCUMENT_UPLOADED: 'document-uploaded',
  DOCUMENT_VERIFIED: 'document-verified',
  DOCUMENT_REJECTED: 'document-rejected',
  DOCUMENT_MISSING: 'document-missing',

  // Trip notifications
  DEPARTURE_REMINDER: 'departure-reminder',
  ROOM_ASSIGNMENT: 'room-assignment',
  FLIGHT_CHANGE: 'flight-change',
  TRIP_UPDATE: 'trip-update',

  // Marketing notifications
  NEW_PACKAGE_AVAILABLE: 'new-package-available',
  EARLY_BIRD_OFFER: 'early-bird-offer',
  LAST_MINUTE_OFFER: 'last-minute-offer',

  // General notifications
  MAINTENANCE_SCHEDULE: 'maintenance-schedule',
  SYSTEM_ANNOUNCEMENT: 'system-announcement',
} as const;

export const REPORT_FORMATS = {
  CSV: 'csv',
  XLSX: 'xlsx',
  PDF: 'pdf',
  JSON: 'json',
} as const;

export const NOTIFICATION_CHANNELS = {
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH_NOTIFICATION: 'push_notification',
  IN_APP: 'in_app',
} as const;
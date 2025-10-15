-- Enable Row Level Security for all tenant-isolated tables
-- This script enables RLS and creates policies for tenant isolation

-- Function to set current tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_uuid, false);
END;
$$ LANGUAGE plpgsql;

-- Get current tenant context function
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_tenant', true);
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all business tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilgrims ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY tenant_isolation_users ON users
FOR ALL
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

-- Packages table policies
CREATE POLICY tenant_isolation_packages ON packages
FOR ALL
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

-- Customers table policies
CREATE POLICY tenant_isolation_customers ON customers
FOR ALL
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

-- Bookings table policies
CREATE POLICY tenant_isolation_bookings ON bookings
FOR ALL
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

-- Pilgrims table policies
CREATE POLICY tenant_isolation_pilgrims ON pilgrims
FOR ALL
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

-- Invoices table policies
CREATE POLICY tenant_isolation_invoices ON invoices
FOR ALL
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

-- Payments table policies
CREATE POLICY tenant_isolation_payments ON payments
FOR ALL
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

-- Notifications table policies
CREATE POLICY tenant_isolation_notifications ON notifications
FOR ALL
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

-- Audit logs table policies (read-only for users)
CREATE POLICY tenant_isolation_audit_logs_read ON audit_logs
FOR SELECT
USING (tenant_id = current_tenant_id());

-- Allow system to write audit logs
CREATE POLICY tenant_isolation_audit_logs_write ON audit_logs
FOR INSERT
WITH CHECK (tenant_id = current_tenant_id());

-- Function to automatically set tenant_id and audit fields
CREATE OR REPLACE FUNCTION set_tenant_and_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Set tenant_id from current context
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := current_tenant_id();
  END IF;

  -- Set audit fields
  IF TG_OP = 'INSERT' THEN
    NEW.created_at := COALESCE(NEW.created_at, NOW());
    NEW.updated_at := COALESCE(NEW.updated_at, NOW());
    IF NEW.created_by IS NULL AND current_setting('app.current_user_id', true) IS NOT NULL THEN
      NEW.created_by := current_setting('app.current_user_id', true);
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_at := NOW();
    IF current_setting('app.current_user_id', true) IS NOT NULL THEN
      NEW.updated_by := current_setting('app.current_user_id', true);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER set_tenant_and_audit_users
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_tenant_and_audit_fields();

CREATE TRIGGER set_tenant_and_audit_packages
  BEFORE INSERT OR UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION set_tenant_and_audit_fields();

CREATE TRIGGER set_tenant_and_audit_customers
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_tenant_and_audit_fields();

CREATE TRIGGER set_tenant_and_audit_bookings
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_tenant_and_audit_fields();

CREATE TRIGGER set_tenant_and_audit_pilgrims
  BEFORE INSERT OR UPDATE ON pilgrims
  FOR EACH ROW EXECUTE FUNCTION set_tenant_and_audit_fields();

CREATE TRIGGER set_tenant_and_audit_invoices
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_tenant_and_audit_fields();

CREATE TRIGGER set_tenant_and_audit_payments
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_tenant_and_audit_fields();

CREATE TRIGGER set_tenant_and_audit_notifications
  BEFORE INSERT OR UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION set_tenant_and_audit_fields();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (tenant_id, entity, entity_id, action, new_values)
    VALUES (
      COALESCE(NEW.tenant_id, current_tenant_id()),
      TG_TABLE_NAME,
      NEW.id,
      'CREATE',
      row_to_json(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (tenant_id, entity, entity_id, action, old_values, new_values)
    VALUES (
      COALESCE(NEW.tenant_id, current_tenant_id()),
      TG_TABLE_NAME,
      NEW.id,
      'UPDATE',
      row_to_json(OLD),
      row_to_json(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (tenant_id, entity, entity_id, action, old_values)
    VALUES (
      OLD.tenant_id,
      TG_TABLE_NAME,
      OLD.id,
      'DELETE',
      row_to_json(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to business tables
CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_packages
  AFTER INSERT OR UPDATE OR DELETE ON packages
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_customers
  AFTER INSERT OR UPDATE OR DELETE ON customers
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_bookings
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_pilgrims
  AFTER INSERT OR UPDATE OR DELETE ON pilgrims
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_notifications
  AFTER INSERT OR UPDATE OR DELETE ON notifications
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
-- Add actual_paid_amount column to purchases table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS actual_paid_amount FLOAT;

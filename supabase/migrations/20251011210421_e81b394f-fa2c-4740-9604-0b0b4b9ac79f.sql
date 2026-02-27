-- Add payment method to bookings table
ALTER TABLE public.bookings 
ADD COLUMN payment_method TEXT CHECK (payment_method IN ('after_service', 'baridi_mob', 'paypal', 'visa', 'mastercard'));

-- Add default value for existing rows
UPDATE public.bookings SET payment_method = 'after_service' WHERE payment_method IS NULL;
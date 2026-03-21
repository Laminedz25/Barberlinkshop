-- Create a default template if none exists
INSERT INTO email_templates (temp_name, content, render) 
SELECT 'BarberLink Default', 'Hello, your booking is confirmed.', 'Hello, your booking is confirmed.'
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE temp_name = 'BarberLink Default');

-- Create an API key
-- We'll use a fixed API key for now so we know what it is
INSERT INTO api_templates (api_key, api_name, template_id, subject, addresser, active)
SELECT 'bl_api_72a1b9c3e5d7f8g9h0i1k2l3m4n5o6p', 'BarberLink Main API', id, 'BarberLink Notification', 'noreply@barberlink.cloud', 1
FROM email_templates 
WHERE temp_name = 'BarberLink Default'
ON CONFLICT (api_key) DO NOTHING;

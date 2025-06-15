-- Create test database for development
-- The main development database (music_label_dev) is created automatically by POSTGRES_DB

-- Create test database
CREATE DATABASE music_label_test;

-- Grant permissions to postgres user (already the owner)
GRANT ALL PRIVILEGES ON DATABASE music_label_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE music_label_test TO postgres;

-- Display created databases
\l
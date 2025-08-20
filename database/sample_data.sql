-- Sample data for testing the School Management API

USE school_management;

-- Clear existing data (optional)
-- DELETE FROM schools;

-- Insert comprehensive sample data
INSERT INTO schools (name, address, latitude, longitude) VALUES
    -- New York City area schools
    ('Manhattan High School', '100 Broadway, New York, NY 10005', 40.7074, -74.0113),
    ('Brooklyn Academy', '200 Atlantic Avenue, Brooklyn, NY 11201', 40.6892, -73.9942),
    ('Queens Elementary', '300 Northern Boulevard, Queens, NY 11101', 40.7505, -73.9934),
    ('Bronx Science High', '400 East Fordham Road, Bronx, NY 10458', 40.8618, -73.8909),
    ('Staten Island Prep', '500 Victory Boulevard, Staten Island, NY 10301', 40.6195, -74.0776),

    -- Educational institutions with diverse locations
    ('Liberty Elementary', '150 Liberty Street, Jersey City, NJ 07302', 40.7178, -74.0431),
    ('Washington Middle School', '250 Washington Street, Hoboken, NJ 07030', 40.7439, -74.0323),
    ('Lincoln Technical Institute', '350 Lincoln Avenue, Newark, NJ 07102', 40.7282, -74.1776),
    ('Roosevelt High School', '450 Roosevelt Avenue, Union City, NJ 07087', 40.7648, -74.0267),
    ('Jefferson Academy', '550 Jefferson Street, West New York, NJ 07093', 40.7879, -74.0143),

    -- Schools with international-style names
    ('International School of Excellence', '600 International Drive, Weehawken, NJ 07086', 40.7698, -74.0143),
    ('Global Learning Center', '700 Global Way, North Bergen, NJ 07047', 40.8043, -74.0121),
    ('World Academy of Sciences', '800 Science Park, Secaucus, NJ 07094', 40.7895, -74.0565),
    ('United Nations School', '900 UN Plaza, New York, NY 10017', 40.7528, -73.9687),
    ('Cosmos International Academy', '1000 Cosmos Boulevard, Long Island City, NY 11101', 40.7282, -73.9942),

    -- Specialized schools
    ('Tech Innovation High', '1100 Innovation Drive, Piscataway, NJ 08854', 40.5795, -74.4656),
    ('Arts & Creative Academy', '1200 Creative Lane, Morristown, NJ 07960', 40.7968, -74.4815),
    ('Sports Excellence Institute', '1300 Athletic Avenue, East Brunswick, NJ 08816', 40.4282, -74.4121),
    ('STEM Magnet School', '1400 Science Circle, Princeton, NJ 08540', 40.3573, -74.6672),
    ('Performing Arts Academy', '1500 Performance Plaza, Trenton, NJ 08608', 40.2206, -74.7565);

-- Verify the data
SELECT COUNT(*) as total_schools FROM schools;
SELECT * FROM schools ORDER BY name LIMIT 5;

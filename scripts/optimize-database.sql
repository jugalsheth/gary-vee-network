-- Database Optimization Scripts for Gary Vee Network
-- Run these scripts in Snowflake to improve search performance

-- 1. Create search optimization on the contacts table
CREATE SEARCH OPTIMIZATION ON gary_vee_contacts;

-- 2. Create full-text search indexes for better search performance
CREATE INDEX idx_contacts_name_search ON gary_vee_contacts (name) USING FULLTEXT;
CREATE INDEX idx_contacts_email_search ON gary_vee_contacts (email) USING FULLTEXT;
CREATE INDEX idx_contacts_notes_search ON gary_vee_contacts (notes) USING FULLTEXT;
CREATE INDEX idx_contacts_location_search ON gary_vee_contacts (location) USING FULLTEXT;

-- 3. Create composite indexes for common query patterns
CREATE INDEX idx_contacts_tier_location ON gary_vee_contacts (tier, location);
CREATE INDEX idx_contacts_created_at ON gary_vee_contacts (created_at DESC);
CREATE INDEX idx_contacts_updated_at ON gary_vee_contacts (updated_at DESC);

-- 4. Create indexes for filtering operations
CREATE INDEX idx_contacts_has_kids ON gary_vee_contacts (has_kids);
CREATE INDEX idx_contacts_is_married ON gary_vee_contacts (is_married);
CREATE INDEX idx_contacts_contact_type ON gary_vee_contacts (contact_type);

-- 5. Create indexes for relationship queries
CREATE INDEX idx_contacts_relationship ON gary_vee_contacts (relationship_to_gary);

-- 6. Create indexes for analytics queries
CREATE INDEX idx_contacts_tier_created ON gary_vee_contacts (tier, created_at DESC);
CREATE INDEX idx_contacts_location_tier ON gary_vee_contacts (location, tier);

-- 7. Create materialized view for common analytics (optional - for very large datasets)
-- CREATE MATERIALIZED VIEW mv_contact_analytics AS
-- SELECT 
--   tier,
--   location,
--   COUNT(*) as count,
--   AVG(EXTRACT(DAY FROM CURRENT_DATE - created_at)) as avg_days_since_created
-- FROM gary_vee_contacts
-- GROUP BY tier, location;

-- 8. Optimize table clustering for better query performance
ALTER TABLE gary_vee_contacts CLUSTER BY (tier, created_at DESC);

-- 9. Set up auto-clustering for ongoing optimization
ALTER TABLE gary_vee_contacts SET AUTO_CLUSTER = TRUE;

-- 10. Create a view for optimized search queries
CREATE OR REPLACE VIEW v_contacts_search AS
SELECT 
  id,
  name,
  email,
  phone,
  location,
  notes,
  tier,
  contact_type,
  has_kids,
  is_married,
  relationship_to_gary,
  created_at,
  updated_at,
  -- Add search relevance score
  CASE 
    WHEN LOWER(name) LIKE LOWER(?) THEN 100
    WHEN LOWER(email) LIKE LOWER(?) THEN 80
    WHEN LOWER(notes) LIKE LOWER(?) THEN 60
    WHEN LOWER(location) LIKE LOWER(?) THEN 40
    ELSE 0
  END as search_score
FROM gary_vee_contacts;

-- 11. Create stored procedure for optimized search
CREATE OR REPLACE PROCEDURE optimized_contact_search(
  search_query STRING,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 50
)
RETURNS TABLE (
  id STRING,
  name STRING,
  email STRING,
  phone STRING,
  location STRING,
  notes STRING,
  tier STRING,
  contact_type STRING,
  has_kids BOOLEAN,
  is_married BOOLEAN,
  relationship_to_gary STRING,
  created_at TIMESTAMP_NTZ,
  updated_at TIMESTAMP_NTZ,
  search_score INTEGER
)
LANGUAGE SQL
AS
$$
BEGIN
  RETURN TABLE (
    SELECT 
      id,
      name,
      email,
      phone,
      location,
      notes,
      tier,
      contact_type,
      has_kids,
      is_married,
      relationship_to_gary,
      created_at,
      updated_at,
      CASE 
        WHEN LOWER(name) LIKE LOWER('%' || search_query || '%') THEN 100
        WHEN LOWER(email) LIKE LOWER('%' || search_query || '%') THEN 80
        WHEN LOWER(notes) LIKE LOWER('%' || search_query || '%') THEN 60
        WHEN LOWER(location) LIKE LOWER('%' || search_query || '%') THEN 40
        ELSE 0
      END as search_score
    FROM gary_vee_contacts
    WHERE 
      LOWER(name) LIKE LOWER('%' || search_query || '%') OR
      LOWER(email) LIKE LOWER('%' || search_query || '%') OR
      LOWER(notes) LIKE LOWER('%' || search_query || '%') OR
      LOWER(location) LIKE LOWER('%' || search_query || '%')
    ORDER BY search_score DESC, created_at DESC
    LIMIT page_size
    OFFSET (page_number - 1) * page_size
  );
END;
$$;

-- 12. Create function to get search result count
CREATE OR REPLACE FUNCTION get_search_count(search_query STRING)
RETURNS INTEGER
LANGUAGE SQL
AS
$$
  SELECT COUNT(*)
  FROM gary_vee_contacts
  WHERE 
    LOWER(name) LIKE LOWER('%' || search_query || '%') OR
    LOWER(email) LIKE LOWER('%' || search_query || '%') OR
    LOWER(notes) LIKE LOWER('%' || search_query || '%') OR
    LOWER(location) LIKE LOWER('%' || search_query || '%')
$$;

-- 13. Monitor query performance
-- Run this to see which queries are slow:
-- SELECT * FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())
-- WHERE QUERY_TEXT LIKE '%gary_vee_contacts%'
-- ORDER BY START_TIME DESC
-- LIMIT 100;

-- 14. Check index usage
-- SELECT * FROM TABLE(INFORMATION_SCHEMA.INDEX_USAGE_HISTORY())
-- WHERE TABLE_NAME = 'GARY_VEE_CONTACTS'
-- ORDER BY LAST_USED DESC;

-- 15. Monitor warehouse usage
-- SELECT * FROM TABLE(INFORMATION_SCHEMA.WAREHOUSE_METERING_HISTORY(
--   DATE_RANGE_START=>DATEADD('day', -7, CURRENT_DATE()),
--   DATE_RANGE_END=>CURRENT_DATE()
-- ));

-- Performance Monitoring Queries:

-- Check table size and clustering
SELECT 
  TABLE_NAME,
  ROW_COUNT,
  BYTES,
  CLUSTERING_KEY,
  AUTO_CLUSTERING_ON
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'GARY_VEE_CONTACTS';

-- Check index status
SELECT 
  INDEX_NAME,
  INDEX_TYPE,
  IS_UNIQUE,
  IS_ENABLED
FROM INFORMATION_SCHEMA.INDEXES 
WHERE TABLE_NAME = 'GARY_VEE_CONTACTS';

-- Monitor slow queries
SELECT 
  QUERY_TEXT,
  EXECUTION_TIME,
  START_TIME,
  END_TIME,
  BYTES_SCANNED,
  ROWS_PRODUCED
FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())
WHERE 
  QUERY_TEXT LIKE '%gary_vee_contacts%' AND
  EXECUTION_TIME > 1000  -- Queries taking more than 1 second
ORDER BY EXECUTION_TIME DESC
LIMIT 20;

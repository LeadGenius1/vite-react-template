-- Migration 1 rollback: Remove initial tables
-- Warning: This will delete all user and contact data
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
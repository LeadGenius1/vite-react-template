-- Migration 7 rollback: Remove workflow tables
-- Note: We don't drop users and contacts tables as they may be used by other parts of the system
DROP TABLE IF EXISTS workflow_executions CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;

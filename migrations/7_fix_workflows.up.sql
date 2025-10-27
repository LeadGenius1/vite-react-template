-- Migration 7: Fix workflow tables conflict
-- This migration handles the case where workflow tables might already exist

-- First, drop existing tables if they exist (CASCADE will handle foreign key dependencies)
DROP TABLE IF EXISTS workflow_executions CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;

-- Create workflows table with correct schema
CREATE TABLE workflows (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_config TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for workflows table
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_enabled ON workflows(enabled);

-- Create workflow_executions table
CREATE TABLE workflow_executions (
  id BIGSERIAL PRIMARY KEY,
  workflow_id BIGINT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  contact_id BIGINT REFERENCES contacts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  result TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for workflow_executions table
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
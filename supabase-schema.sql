-- OceanGuard Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hazard Reports Table
CREATE TABLE IF NOT EXISTS hazard_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hazard_type VARCHAR(50) NOT NULL CHECK (hazard_type IN ('tsunami', 'storm_surge', 'high_waves', 'coastal_flooding', 'cyclone', 'erosion')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT,
  location_name VARCHAR(255),
  media_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'responded', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Social Analytics Table
CREATE TABLE IF NOT EXISTS social_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  mention_count INTEGER DEFAULT 0,
  sentiment_score DECIMAL(3, 2),
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_hazard_reports_user_id ON hazard_reports(user_id);
CREATE INDEX idx_hazard_reports_created_at ON hazard_reports(created_at DESC);
CREATE INDEX idx_hazard_reports_location ON hazard_reports(latitude, longitude);
CREATE INDEX idx_hazard_reports_severity ON hazard_reports(severity);

-- Enable Row Level Security
ALTER TABLE hazard_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hazard_reports
CREATE POLICY "Anyone can view hazard reports"
  ON hazard_reports FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create hazard reports"
  ON hazard_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON hazard_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for social_analytics
CREATE POLICY "Anyone can view social analytics"
  ON social_analytics FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert analytics"
  ON social_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_hazard_reports_updated_at
  BEFORE UPDATE ON hazard_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for hazard_reports
ALTER PUBLICATION supabase_realtime ADD TABLE hazard_reports;

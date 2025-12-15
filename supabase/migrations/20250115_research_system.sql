-- Create course_units table
CREATE TABLE IF NOT EXISTS course_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topics TEXT[] DEFAULT '{}',
    course_name TEXT,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(title, user_id)
);

-- Create research_sources table
CREATE TABLE IF NOT EXISTS research_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES course_units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    snippet TEXT,
    type TEXT CHECK (type IN ('article', 'video', 'book', 'paper')) DEFAULT 'article',
    relevance_score DECIMAL(3,2) DEFAULT 0.5,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(url, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_course_units_user_id ON course_units(user_id);
CREATE INDEX IF NOT EXISTS idx_course_units_completed ON course_units(completed);
CREATE INDEX IF NOT EXISTS idx_research_sources_user_id ON research_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_research_sources_unit_id ON research_sources(unit_id);
CREATE INDEX IF NOT EXISTS idx_research_sources_relevance ON research_sources(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_research_sources_type ON research_sources(type);

-- Enable Row Level Security
ALTER TABLE course_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_sources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_units
CREATE POLICY "Users can view their own course units"
    ON course_units FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course units"
    ON course_units FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course units"
    ON course_units FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own course units"
    ON course_units FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for research_sources
CREATE POLICY "Users can view their own research sources"
    ON research_sources FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own research sources"
    ON research_sources FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research sources"
    ON research_sources FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research sources"
    ON research_sources FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_course_units_updated_at
    BEFORE UPDATE ON course_units
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

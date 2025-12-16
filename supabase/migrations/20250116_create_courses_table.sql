-- Create courses table for storing student course information
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    instructor TEXT,
    semester TEXT,
    description TEXT,
    units JSONB DEFAULT '[]'::jsonb, -- Array of unit objects {title, topics[], resources[]}
    resources JSONB DEFAULT '[]'::jsonb, -- Recommended resources {title, type, url, description}
    study_suggestions TEXT, -- AI-generated study approach
    ai_analysis TEXT, -- Comprehensive course analysis
    is_analyzed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own courses
CREATE POLICY "Users can view own courses"
    ON courses FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own courses
CREATE POLICY "Users can insert own courses"
    ON courses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own courses
CREATE POLICY "Users can update own courses"
    ON courses FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own courses
CREATE POLICY "Users can delete own courses"
    ON courses FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS courses_user_id_idx ON courses(user_id);
CREATE INDEX IF NOT EXISTS courses_semester_idx ON courses(semester);

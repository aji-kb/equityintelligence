-- 1. Create a table for Macro Indicators (India Focus)
CREATE TABLE macro_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_name VARCHAR(100) NOT NULL, -- e.g., 'RBI_REPO_RATE', 'CPI_INFLATION'
    indicator_category VARCHAR(50),       -- e.g., 'Monetary', 'Growth', 'Currency'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE macro_indicators_data
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    macro_indicators_id UUID REFERENCES macro_indicators (id),
    data_value NUMERIC(20, 4) NOT NULL,        -- High precision for rates and yields
    frequency VARCHAR(20) NOT NULL,       -- 'Daily', 'Monthly', 'Quarterly'
    period_date DATE NOT NULL,            -- The date this data applies to
    release_date DATE DEFAULT CURRENT_DATE, -- When it was actually published
    source VARCHAR(100),                  -- e.g., 'RBI', 'MoSPI', 'AlphaVantage'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast time-series analysis
CREATE INDEX idx_macro_name ON macro_indicators (indicator_name DESC);
CREATE INDEX idx_macro_data_date ON macro_indicators_data (period_date DESC);


CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'Power', 'Solar'
    parent_id UUID REFERENCES industries(id), -- If NULL, it's a top-level Sector
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'RELIANCE'
    company_name VARCHAR(255) NOT NULL,
    base_industry_id UUID REFERENCES industries(id), -- Primary industry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE news_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL,
    summary TEXT,
    source_url TEXT,
    sentiment_score INT CHECK (sentiment_score BETWEEN -5 AND 5), -- -5 (Bad) to 5 (Good)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link News to Industries/Sub-Industries
CREATE TABLE news_industries (
    news_id UUID REFERENCES news_events(id) ON DELETE CASCADE,
    industry_id UUID REFERENCES industries(id) ON DELETE CASCADE,
    PRIMARY KEY (news_id, industry_id)
);

-- Link News to Companies
CREATE TABLE news_companies (
    news_id UUID REFERENCES news_events(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    PRIMARY KEY (news_id, company_id)
);

-- Link News to Macro Indicators
CREATE TABLE news_macro (
    news_id UUID REFERENCES news_events(id) ON DELETE CASCADE,
    macro_id UUID REFERENCES macro_indicators(id) ON DELETE CASCADE,
    PRIMARY KEY (news_id, macro_id)
);


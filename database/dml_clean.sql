-- 1. Create a table for Macro Indicators (India Focus)
CREATE TABLE macro_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_name VARCHAR(100) NOT NULL, -- e.g., 'RBI_REPO_RATE', 'CPI_INFLATION'
    indicator_category VARCHAR(50),       -- e.g., 'Monetary', 'Growth', 'Currency'
    value NUMERIC(20, 4) NOT NULL,        -- High precision for rates and yields
    frequency VARCHAR(20) NOT NULL,       -- 'Daily', 'Monthly', 'Quarterly'
    period_date DATE NOT NULL,            -- The date this data applies to
    release_date DATE DEFAULT CURRENT_DATE, -- When it was actually published
    source VARCHAR(100),                  -- e.g., 'RBI', 'MoSPI', 'AlphaVantage'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate entries for the same indicator on the same date
    UNIQUE(indicator_name, period_date)
);

-- Index for fast time-series analysis
CREATE INDEX idx_macro_date_name ON macro_indicators (indicator_name, period_date DESC);

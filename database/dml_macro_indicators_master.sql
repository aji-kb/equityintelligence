-- Macro Indicators Master Data Insert Script
-- This script inserts common macroeconomic indicators for India into the macro_indicators table.

INSERT INTO macro_indicators (indicator_name, indicator_category)
VALUES
  ('RBI_REPO_RATE', 'Monetary'),
  ('CPI_INFLATION', 'Inflation'),
  ('WPI_INFLATION', 'Inflation'),
  ('GDP_GROWTH', 'Growth'),
  ('UNEMPLOYMENT_RATE', 'Labour'),
  ('CURRENT_ACCOUNT_DEFICIT', 'External'),
  ('FISCAL_DEFICIT', 'Fiscal'),
  ('EXCHANGE_RATE_USD_INR', 'Currency'),
  ('FOREX_RESERVES', 'External'),
  ('BANK_CREDIT_GROWTH', 'Monetary'),
  ('IIP', 'Growth'),
  ('PMI_MANUFACTURING', 'Growth'),
  ('PMI_SERVICES', 'Growth'),
  ('CRUDE_OIL_PRICE', 'Commodity'),
  ('GOLD_PRICE', 'Commodity'),
  ('SENSEX', 'Market'),
  ('NIFTY_50', 'Market');

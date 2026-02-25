from pydantic import BaseModel, HttpUrl, Field, ConfigDict
from typing import Optional, List
from datetime import date
from uuid import UUID

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# Industry
class IndustryBase(BaseSchema):
    name: str
    parent_id: Optional[UUID] = None
    description: Optional[str] = None

class IndustryCreate(IndustryBase): pass

class IndustryOut(IndustryBase):
    id: UUID

# Company
class CompanyBase(BaseSchema):
    ticker: str
    company_name: str
    base_industry_id: Optional[UUID] = None

class CompanyCreate(CompanyBase): pass

# The Update Schema: All fields are Optional
class CompanyUpdate(BaseModel):
    ticker: Optional[str] = None
    company_name: Optional[str] = None
    base_industry_id: Optional[UUID] = None
    
class CompanyOut(CompanyBase):
    id: UUID

# Macro
class MacroBase(BaseSchema):
    indicator_name: str
    category: Optional[str] = None

class MacroCreate(MacroBase): pass

class MacroOut(MacroBase):
    id: UUID

# News
class NewsCreate(BaseSchema):
    title: str
    summary: Optional[str] = None
    event_date: date = Field(default_factory=date.today)
    source_url: Optional[str] = None
    sentiment_score: Optional[int] = Field(default=None, ge=-5, le=5, nullable=True)
    industry_ids: List[UUID] = Field(default_factory=list)
    company_ids: List[UUID] = Field(default_factory=list)
    macro_ids: List[UUID] = Field(default_factory=list)

class NewsOut(BaseSchema):
    id: UUID
    title: str
    summary: Optional[str] = None
    source_url: Optional[str] = None
    event_date: date
    sentiment_score: Optional[int]
    industries: List[IndustryOut]
    companies: List[CompanyOut]
    macros: List[MacroOut]
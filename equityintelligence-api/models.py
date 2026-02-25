import uuid
from sqlalchemy import Column, String, Text, Integer, Date, ForeignKey, Table, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, DeclarativeBase

class Base(DeclarativeBase):
    pass

# Junction Tables (Many-to-Many)
news_industries = Table(
    "news_industries", Base.metadata,
    Column("news_id", UUID(as_uuid=True), ForeignKey("news_events.id", ondelete="CASCADE"), primary_key=True),
    Column("industry_id", UUID(as_uuid=True), ForeignKey("industries.id", ondelete="CASCADE"), primary_key=True)
)

news_companies = Table(
    "news_companies", Base.metadata,
    Column("news_id", UUID(as_uuid=True), ForeignKey("news_events.id", ondelete="CASCADE"), primary_key=True),
    Column("company_id", UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), primary_key=True)
)

news_macro = Table(
    "news_macro", Base.metadata,
    Column("news_id", UUID(as_uuid=True), ForeignKey("news_events.id", ondelete="CASCADE"), primary_key=True),
    Column("macro_id", UUID(as_uuid=True), ForeignKey("macro_indicators.id", ondelete="CASCADE"), primary_key=True)
)

class Industry(Base):
    __tablename__ = "industries"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("industries.id"))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Hierarchy relationship
    sub_industries = relationship("Industry", backref="parent", remote_side=[id])

class MacroIndicator(Base):
    __tablename__ = "macro_indicators"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    indicator_name = Column(String(100), nullable=False, unique=True)
    category = Column("indicator_category", String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Company(Base):
    __tablename__ = "companies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String(20), unique=True, nullable=False)
    company_name = Column(String(255), nullable=False)
    base_industry_id = Column(UUID(as_uuid=True), ForeignKey("industries.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class NewsEvent(Base):
    __tablename__ = "news_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_date = Column(Date, nullable=False, server_default=func.current_date())
    title = Column(String, nullable=False)
    summary = Column(Text)
    source_url = Column(String)
    sentiment_score = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Tagging Relationships
    industries = relationship("Industry", secondary=news_industries)
    companies = relationship("Company", secondary=news_companies)
    macros = relationship("MacroIndicator", secondary=news_macro)
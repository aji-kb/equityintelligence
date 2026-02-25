from fastapi import Body
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
from uuid import UUID

app = FastAPI(title="EquiTrack API")

# 1. Define the origins that are allowed to talk to your API
origins = [
    "http://localhost:5174",  # React/Vite default port
    "http://127.0.0.1:5174",
]

# 2. Add the middleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Allows requests from your React app
    allow_credentials=True,
    allow_methods=["*"],             # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],             # Allows all headers (Content-Type, Authorization, etc.)
)

# Initialize DB Tables
models.Base.metadata.create_all(bind=database.engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- INDUSTRY ENDPOINTS ---
from uuid import UUID
@app.patch("/industries/{industry_id}", response_model=schemas.IndustryOut)
def update_industry(industry_id: UUID, industry_update: schemas.IndustryCreate, db: Session = Depends(get_db)):
    db_industry = db.query(models.Industry).filter(models.Industry.id == industry_id).first()
    if not db_industry:
        raise HTTPException(status_code=404, detail="Industry not found")
    update_data = industry_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_industry, key, value)
    db.commit()
    db.refresh(db_industry)
    return db_industry
@app.post("/industries/", response_model=schemas.IndustryOut)
def create_industry(industry: schemas.IndustryCreate, db: Session = Depends(get_db)):
    db_industry = models.Industry(**industry.model_dump())
    db.add(db_industry)
    db.commit()
    db.refresh(db_industry)
    return db_industry

@app.get("/industries/", response_model=List[schemas.IndustryOut])
def get_industries(db: Session = Depends(get_db)):
    return db.query(models.Industry).all()

# --- COMPANY ENDPOINTS ---
@app.post("/companies/", response_model=schemas.CompanyOut)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    db_company = models.Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@app.get("/companies/", response_model=List[schemas.CompanyOut])
def list_companies(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    """Retrieve a list of companies with pagination."""
    return db.query(models.Company).offset(skip).limit(limit).all()

@app.get("/companies/{company_id}", response_model=schemas.CompanyOut)
def get_company(company_id: UUID, db: Session = Depends(database.get_db)):
    """Get details for a specific company."""
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@app.patch("/companies/{company_id}", response_model=schemas.CompanyOut)
def update_company(company_id: UUID, company_update: schemas.CompanyUpdate, db: Session = Depends(database.get_db)):
    """Edit a company's details (Partial Update)."""
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Convert Pydantic model to dict, excluding fields that weren't set in the request
    update_data = company_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_company, key, value)
    
    db.commit()
    db.refresh(db_company)
    return db_company

@app.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(company_id: UUID, db: Session = Depends(database.get_db)):
    """Remove a company from the tracking list."""
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db.delete(db_company)
    db.commit()
    return None

# --- NEWS ENDPOINTS ---
@app.post("/news/", response_model=schemas.NewsOut)
def create_news_event(news: schemas.NewsCreate, db: Session = Depends(get_db)):
    # 1. Create the base news event
    news_data = news.model_dump(exclude={"industry_ids", "company_ids", "macro_ids"})
    db_news = models.NewsEvent(**news_data)

    # 2. Add Relationships
    if news.industry_ids:
        db_news.industries = db.query(models.Industry).filter(models.Industry.id.in_(news.industry_ids)).all()
    if news.company_ids:
        db_news.companies = db.query(models.Company).filter(models.Company.id.in_(news.company_ids)).all()
    if news.macro_ids:
        db_news.macros = db.query(models.MacroIndicator).filter(models.MacroIndicator.id.in_(news.macro_ids)).all()

    db.add(db_news)
    db.commit()
    db.refresh(db_news)
    return db_news

@app.get("/news/", response_model=List[schemas.NewsOut])
def list_news(db: Session = Depends(get_db)):
    return db.query(models.NewsEvent).all()

# --- MACRO INDICATOR ENDPOINTS ---
@app.get("/macro_indicators", response_model=List[schemas.MacroOut])
def list_macro_indicators(db: Session = Depends(get_db)):
    return db.query(models.MacroIndicator).all()

@app.post("/macro_indicators", response_model=schemas.MacroOut)
def add_macro_indicator(macro: schemas.MacroCreate, db: Session = Depends(get_db)):
    db_macro = models.MacroIndicator(**macro.model_dump())
    db.add(db_macro)
    db.commit()
    db.refresh(db_macro)
    return db_macro

@app.put("/macro_indicators/{macro_id}", response_model=schemas.MacroOut)
def update_macro_indicator(macro_id: UUID, macro: schemas.MacroCreate = Body(...), db: Session = Depends(get_db)):
    db_macro = db.query(models.MacroIndicator).filter(models.MacroIndicator.id == macro_id).first()
    if not db_macro:
        raise HTTPException(status_code=404, detail="Macro Indicator not found")
    for key, value in macro.model_dump().items():
        setattr(db_macro, key, value)
    db.commit()
    db.refresh(db_macro)
    return db_macro

# Delete Macro Indicator
@app.delete("/macro_indicators/{macro_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_macro_indicator(macro_id: UUID, db: Session = Depends(get_db)):
    db_macro = db.query(models.MacroIndicator).filter(models.MacroIndicator.id == macro_id).first()
    if not db_macro:
        raise HTTPException(status_code=404, detail="Macro Indicator not found")
    db.delete(db_macro)
    db.commit()
    return None
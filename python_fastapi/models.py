from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import ForeignKey, Date, String, Text
from database import Base
from typing import Optional
from datetime import date

# User Table 
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(unique=True)
    password: Mapped[str] = mapped_column()
    
    
# Job Application Table
class Application(Base):
    __tablename__ = 'applications'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    company_name: Mapped[str] = mapped_column(String(50))
    role: Mapped[str] = mapped_column(String(30))
    application_status: Mapped[str] = mapped_column(default="applied")
    portal: Mapped[str] = mapped_column(default='None')
    date_applied: Mapped[date] = mapped_column(Date)
    date_of_interview: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    # map to users table
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
      
# Contacts Table
class Contacts(Base):
    __tablename__ = 'contacts'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    phone: Mapped[str] = mapped_column(String(10))
    social_url: Mapped[Optional[str]] = mapped_column()
    
    # maps to applications
    application_id: Mapped[int] = mapped_column(ForeignKey('applications.id', ondelete="CASCADE"))
    
# interview notes
class InterviewNotes(Base):
    __tablename__ = 'interview_notes'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    round: Mapped[str] = mapped_column(String(30))
    interview_date: Mapped[date] = mapped_column(Date)
    notes: Mapped[str] = mapped_column(Text)
    
    # maps to applications
    application_id: Mapped[int] = mapped_column(ForeignKey('applications.id', ondelete="CASCADE"))
    

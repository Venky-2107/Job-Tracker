from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

# Register request
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

# Register response
class RegisterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str

# Login request
class LoginRequest(BaseModel):
    email: str
    password: str

# Login response
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# application request
class CreateApplicationRequest(BaseModel):
    company_name: str
    role: str
    application_status: str
    portal: str
    date_of_interview: Optional[date]
  
# application response  
class CreateApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    company_name: str
    role: str
    application_status: str
    portal: str
    date_applied: date
    date_of_interview: Optional[date]
    user_id: int
    
# contact request
class ContactRequest(BaseModel):
    name: str
    email: Optional[str]
    phone: str
    social_url: Optional[str]
    
# contact response
class ContactResponse(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    
    id: int
    name: str
    email: Optional[str]
    phone: str
    social_url: Optional[str]
    application_id: int
    
# Interview note request
class InterviewNoteRequest(BaseModel):
    round: str
    interview_date: date
    notes: str
    
# Interview note response
class InterviewNoteResponse(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    
    id: int
    round: str
    interview_date: date
    notes: str
    application_id: int
    
class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str
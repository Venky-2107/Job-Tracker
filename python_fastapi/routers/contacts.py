from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from oauth2 import get_current_user
from models import Contacts, Application, User
from schemas import (
    ContactRequest, 
    ContactResponse
)

# instance of APIRouter
contact_router = APIRouter(prefix='/application', tags=['contacts'])

# creating/adding a new contact
@contact_router.post('/{appl_id}/contacts',response_model=ContactResponse, status_code=201)
def create_contact(appl_id: int, contact: ContactRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_email = current_user['sub']
    user = db.query(User).filter(User.email == user_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    application = db.query(Application).filter(
        Application.id == appl_id,
        Application.user_id == user.id  # ← add this
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # check for duplicate contacts
    contact_exist = db.query(Contacts).filter(Contacts.phone == contact.phone, Contacts.application_id == appl_id).first()
    
    if contact_exist:
        raise HTTPException(status_code=401, detail="Contact already exists for this application!!")
    
    new_contact = Contacts(
        name=contact.name,
        email=contact.email,
        phone=contact.phone,
        social_url=contact.social_url,
        application_id=appl_id
    )
    
    # db operations
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    
    return new_contact

# @contact_router.post('/{appl_id}/contacts',response_model=ContactResponse, status_code=201)
@contact_router.get('/{appl_id}/contacts',response_model=list[ContactResponse], status_code=200)
def get_all_contacts(appl_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    
    user_email= current_user['sub']
    
    # find user using the email
    user = db.query(User).filter(User.email == user_email).first()
    
    # raise exception if not user
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    # check if the application exist, also check for the user.
    # so that no other user can directly access other contacts.
    application = db.query(Application).filter(Application.id == appl_id, Application.user_id == user.id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # check for duplicate contacts
    contacts = db.query(Contacts).filter(Contacts.application_id == appl_id).all()
    
    return contacts

# update contact
@contact_router.put('/{appl_id}/contacts/{contact_id}',response_model=ContactResponse, status_code=200)
def update_contact(appl_id: int,contact_id: int, contact:ContactRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_email= current_user['sub']
    
    # find user using the email
    user = db.query(User).filter(User.email == user_email).first()
    
    # raise exception if not user
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    # check if the application exist, also check for the user.
    # so that no other user can directly access other contacts.
    application = db.query(Application).filter(Application.id == appl_id, Application.user_id == user.id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # check contact by id
    contact_exist = db.query(Contacts).filter(Contacts.id == contact_id, Contacts.application_id == appl_id).first()
    
    if not contact_exist:
        raise HTTPException(status_code=404, detail="Contact doesnot exists for this application!!")
    
    contact_exist.name = contact.name
    contact_exist.email = contact.email
    contact_exist.phone = contact.phone
    contact_exist.social_url = contact.social_url
    
    db.commit()
    db.refresh(contact_exist)
    
    return contact_exist

# delete contact
@contact_router.delete('/{appl_id}/contacts/{contact_id}', status_code=200)
def delete_contact(appl_id: int,contact_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_email= current_user['sub']
    
    # find user using the email
    user = db.query(User).filter(User.email == user_email).first()
    
    # raise exception if not user
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    # check if the application exist, also check for the user.
    # so that no other user can directly access other contacts.
    application = db.query(Application).filter(Application.id == appl_id, Application.user_id == user.id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # check contact by id
    contact_exist = db.query(Contacts).filter(Contacts.id == contact_id, Contacts.application_id == appl_id).first()
    
    if not contact_exist:
        raise HTTPException(status_code=404, detail="Contact doesnot exists for this application!!")
    
    db.delete(contact_exist)
    db.commit()
    
    return {'detail': 'contact deleted!!!'}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from oauth2 import get_current_user
from models import InterviewNotes, Application, User
from schemas import (
    InterviewNoteRequest, 
    InterviewNoteResponse
)

# creating instance of APIRouter
notes_router = APIRouter(prefix='/application', tags=['interview_notes'])

# create notes for the applictation id
@notes_router.post('/{appl_id}/notes', response_model=InterviewNoteResponse, status_code=201)
def create_notes(appl_id: int, interview_notes: InterviewNoteRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # get the email from the current_user that returns payload
    # email is fetched from the token
    user_email = current_user['sub']
    user = db.query(User).filter(User.email == user_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    # check if application exists
    # also check if the current user is only trying to acccess the related notes
    application = db.query(Application).filter(
        Application.id == appl_id,
        Application.user_id == user.id  # ← add this
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # check for duplicate notes with round
    # can't have the same round for a same application
    notes_exist = db.query(InterviewNotes).filter(InterviewNotes.round == interview_notes.round, InterviewNotes.application_id == appl_id).first()
    
    if notes_exist:
        raise HTTPException(status_code=401, detail="Interview round exists for this application!!")
    
    new_notes = InterviewNotes(
        round=interview_notes.round,
        interview_date=interview_notes.interview_date,
        notes=interview_notes.notes,
        application_id = appl_id
    )
    
    db.add(new_notes)
    db.commit()
    db.refresh(new_notes)
    
    return new_notes
    
# get all notes
@notes_router.get('/{appl_id}/notes', response_model=list[InterviewNoteResponse], status_code=200)
def get_all_notes(appl_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    
    # get the email from the current_user that returns payload
    # email is fetched from the token
    user_email = current_user['sub']
    user = db.query(User).filter(User.email == user_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    # check if application exists
    # also check if the current user is only trying to acccess the related notes
    application = db.query(Application).filter(
        Application.id == appl_id,
        Application.user_id == user.id  # ← add this
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # check for notes that matches the application id
    notes = db.query(InterviewNotes).filter(InterviewNotes.application_id == appl_id).all()
    
    return notes

# update interview notes
@notes_router.put('/{appl_id}/notes/{note_id}', response_model=InterviewNoteResponse, status_code=200)
def update_notes(appl_id: int,note_id: int, interview_notes: InterviewNoteRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    
    # get the email from the current_user that returns payload
    # email is fetched from the token
    user_email = current_user['sub']
    user = db.query(User).filter(User.email == user_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    # check if application exists
    # also check if the current user is only trying to acccess the related notes
    application = db.query(Application).filter(
        Application.id == appl_id,
        Application.user_id == user.id  # ← add this
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    notes_exist= db.query(InterviewNotes).filter(InterviewNotes.id == note_id, InterviewNotes.application_id == appl_id).first()
    
    if not notes_exist:
        raise HTTPException(status_code=404, detail="Notes for this application not found")
    
    notes_exist.round = interview_notes.round
    notes_exist.interview_date = interview_notes.interview_date
    notes_exist.notes = interview_notes.notes
    
    db.commit()
    db.refresh(notes_exist)
    
    return notes_exist

# delete a note
@notes_router.delete('/{appl_id}/notes/{note_id}', status_code=200)
def delete_notes(appl_id: int,note_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    
    # get the email from the current_user that returns payload
    # email is fetched from the token
    user_email = current_user['sub']
    user = db.query(User).filter(User.email == user_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    # check if application exists
    # also check if the current user is only trying to acccess the related notes
    application = db.query(Application).filter(
        Application.id == appl_id,
        Application.user_id == user.id  # ← add this
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    notes_exist= db.query(InterviewNotes).filter(InterviewNotes.id == note_id, InterviewNotes.application_id == appl_id).first()
    
    if not notes_exist:
        raise HTTPException(status_code=404, detail="Notes for this application not found")
    
    db.delete(notes_exist)
    db.commit()
    
    return {"message": f"notes deleted for the application {application.company_name}"}
    

    
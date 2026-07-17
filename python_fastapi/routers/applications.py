from fastapi import APIRouter, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session
from database import get_db
from oauth2 import get_current_user
from auth import decode_access_token
from models import Application, User
from websocket_manager import manager
from schemas import (
    CreateApplicationRequest, 
    CreateApplicationResponse
)
from datetime import date
import json

# application router instance
appl_router = APIRouter(prefix='/application', tags=['application'])

@appl_router.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket, token:str):
    token_retrieved=decode_access_token(token)
    print("Decoded:", token_retrieved)
    # verify token
    if token_retrieved is None:
        await websocket.close(code=1008)
        return
    
    else:
        # connect
        await manager.connect(websocket)
        try:
            # keep the loop alive
            while True:
                data = await websocket.receive_text()
        except:
            # disconnect on exception
            manager.disconnect(websocket)
            
# create application
@appl_router.post('/', response_model=CreateApplicationResponse, status_code=201)
async def create_application(application: CreateApplicationRequest, current_user=Depends(get_current_user), db: Session =Depends(get_db)):
    
    # because current user contains dict: {'sub':"user email"}
    # since get_current_user decodes access token and returns this dict
    user_email= current_user['sub']
    
    # find user using the email
    user = db.query(User).filter(User.email == user_email).first()
    
    # raise exception if not user
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    # creating new application
    new_application = Application(
        company_name=application.company_name,
        role=application.role,
        application_status= application.application_status,
        portal=application.portal,
        date_applied=date.today(),
        date_of_interview=application.date_of_interview,
        user_id=user.id
    )
    
    db.add(new_application)
    db.commit()
    await manager.broadcast(json.dumps({"event": "application_created"}))
    db.refresh(new_application)
    
    return new_application

# get all applications
@appl_router.get('/', response_model=list[CreateApplicationResponse], status_code=200)
def get_all_applications(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # because current user contains dict: {'sub':"user email"}
    # since get_current_user decodes access token and returns this dict
    user_email= current_user['sub']
    
    # find user using the email
    user = db.query(User).filter(User.email == user_email).first()
    
    # raise exception if not user
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    return db.query(Application).filter(Application.user_id == user.id).all()

# get application by id
@appl_router.get('/{appl_id}', response_model=CreateApplicationResponse, status_code=200)
def get_application_by_id(appl_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    user_email= current_user['sub']
    
    # find user using the email
    user = db.query(User).filter(User.email == user_email).first()
    
    # raise exception if not user
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    application_exist = db.query(Application).filter(Application.id == appl_id, Application.user_id == user.id).first()
    
    if not application_exist:
        raise HTTPException(status_code=404, detail="Application with the id doesnot exist")
    
    return application_exist

# update_application
@appl_router.put('/{appl_id}', response_model=CreateApplicationResponse, status_code=200)
async def update_application_by_id(appl_id: int, application_updates: CreateApplicationRequest, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    user_email= current_user['sub']
    
    # find user using the email
    user = db.query(User).filter(User.email == user_email).first()
    
    # raise exception if not user
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    application_exist = db.query(Application).filter(Application.id == appl_id, Application.user_id == user.id).first()
    
    if not application_exist:
        raise HTTPException(status_code=404, detail="Application with the id doesnot exist")
    
    # update each fields to new values
    application_exist.company_name = application_updates.company_name
    application_exist.role = application_updates.role
    application_exist.application_status = application_updates.application_status
    application_exist.portal = application_updates.portal
    application_exist.date_of_interview = application_updates.date_of_interview
    
    # db operations
    db.commit()
    await manager.broadcast(json.dumps({"event": "application_updated"}))
    db.refresh(application_exist)
    
    return application_exist


# Delete application
@appl_router.delete('/{appl_id}', status_code=200)
async def delete_application_by_id(appl_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    user_email = current_user['sub']
    user = db.query(User).filter(User.email == user_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="user not found!!")
    
    application_exist = db.query(Application).filter(
        Application.id == appl_id,
        Application.user_id == user.id  # ← missing this
    ).first()
    
    if not application_exist:
        raise HTTPException(status_code=404, detail="Application with the id doesnot exist")
    
    db.delete(application_exist)
    db.commit()
    await manager.broadcast(json.dumps({"event": "application_deleted"}))
    
    return {"detail": "Application deleted!!"}

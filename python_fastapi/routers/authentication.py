from fastapi import HTTPException, APIRouter, Depends
from sqlalchemy.orm import Session
from schemas import RegisterRequest, RegisterResponse, LoginRequest, LoginResponse
from models import User
from database import get_db
from auth import hash_password, verify_password, create_access_token

# creating an instance of api-router
auth_router = APIRouter(prefix='/auth', tags=["auth"])

def check_existing_user(email: str, db):
    return db.query(User).filter(User.email == email).first()

# register route - post
@auth_router.post('/register', response_model=RegisterResponse, status_code=201)
def register_user(user: RegisterRequest, db: Session = Depends(get_db)):
    
    # check if user exists
    check_user_exist = check_existing_user(user.email, db)
    
    if check_user_exist:
        raise HTTPException(status_code=400, detail="User with email already exists")
    
    # hash the incoming password
    # error line
    hashed_password = hash_password(user.password)
    
    # create new instance of user model
    user_to_register = User(name=user.name, email=user.email, password=hashed_password)
    
    # db operations
    db.add(user_to_register)
    db.commit()
    # this refreshes and sets the id as well for the new user row
    db.refresh(user_to_register)
    
    # Note: this should match the response model, 
    # all the fields mentioned in response model should be present in this return
    return user_to_register

# Login route
@auth_router.post('/login', response_model=LoginResponse, status_code=200)
def user_login(user: LoginRequest, db: Session = Depends(get_db)):
    # check if user exists
    check_user_exist = check_existing_user(user.email, db)
    
    if not check_user_exist:
        raise HTTPException(status_code=400, detail="User email doesnot exist")
    
    # check for password validity
    is_valid_password = verify_password(user.password, check_user_exist.password)
    
    # raise exception if invalid password
    if not is_valid_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # generate access token
    access_token = create_access_token({'sub': check_user_exist.email})
    
    return {'access_token': access_token}




from passlib.context import CryptContext
from dotenv import load_dotenv
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import os

# create password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated='auto')

# load env variables
load_dotenv()

# Secret Key
SECRET_KEY: str = os.getenv("SECRET_KEY", '')

# Algorithm
ALGORITHM: str = os.getenv("ALGORITHM", '')

# Token expiry time
ACCESS_TOKEN_EXPIRY_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRY_MINUTES") or 30)

# hash password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# verify password
def verify_password(plain_password:str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# create access token
def create_access_token(data: dict):
    data_to_encode = data.copy()
    
    # expiry time: now time + expiry time
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRY_MINUTES)
    
    data_to_encode.update({'exp':expire})
    
    return jwt.encode(data_to_encode, SECRET_KEY, algorithm=ALGORITHM)

# decode access token
def decode_access_token(token:str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
    
    
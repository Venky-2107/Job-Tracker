from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException
from auth import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# dependency to verify current user 
# for every request to the route, verify token using this logic and then move forward
def get_current_user(token:str = Depends(oauth2_scheme)):
    
    # returns the dict which contains the cred used for creating access token
    # for ex. here it was: {'sub': 'email'}
    # check authentication.py for login route
    token_retrieved = decode_access_token(token)
    
    if not token_retrieved:
        raise HTTPException(status_code=401, detail="user not authenticated")
    return token_retrieved
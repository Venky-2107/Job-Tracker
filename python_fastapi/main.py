from fastapi import FastAPI, Request
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from routers import authentication, applications, users, contacts, notes
import time
import models

# Why import models??
# Because Base.metadata.create_all(bind=engine) only creates tables 
# for models that SQLAlchemy knows about.
# SQLAlchemy knows about a model only when that model's file has been imported — 
# importing it registers the classes with Base.metadata.
# If you don't import models, Base.metadata is empty → create_all runs but creates zero tables

# new instance
app = FastAPI()
Base.metadata.create_all(bind=engine)

# middleware for CORS
app.add_middleware(
    CORSMiddleware, 
    allow_origins=['http://localhost:5173', 'https://job-tracker-theta-two.vercel.app', 'http://localhost:3000', "https://job-tracker-next-eg5xsgnyl-venky-2107s-projects.vercel.app"],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time= time.time()
    response = await call_next(request)
    process_time= time.time() - start_time
    print(f"{request.method} - {request.url} -- took -- {process_time:.4f}s")
    return response

# include routers
app.include_router(authentication.auth_router)
app.include_router(applications.appl_router)
app.include_router(contacts.contact_router)
app.include_router(notes.notes_router)

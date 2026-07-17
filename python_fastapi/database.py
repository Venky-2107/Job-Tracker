from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import create_engine
import os

# 1: setup the database url
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///app.db")

# 2: PostgreSQL URLs from Railway start with "postgres://" but SQLAlchemy
# needs "postgresql://" — this fixes that
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://",1)

# Without this, SQLite will throw threading errors locally
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

# 3: create the engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

# 4: create local session
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# 5: base class inheriting DeclarativeBase
class Base(DeclarativeBase):
    pass

# 6: dependency injection
def get_db():
    # create a new isolated db session for the incoming request
    db=SessionLocal()
    
    # Deliver the active database session to the path operation/route handler.
    # This pauses execution here while the API request processes.
    try:
        yield db
        
    # This block executes after the API response is sent back to the user.
    # It guarantees the connection is always closed, preventing leaks.    
    finally:
        db.close()


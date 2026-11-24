from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.auth import create_token, get_current_user, verify_password
from database import Base, engine, get_db
from backend.models import Ticket, User

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Triage App")


class LoginRequest(BaseModel):
    email: str
    password: str


@app.get("/")
def home():
    return {"status": "ok"}


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    return {
        "database": "connected",
        "users": db.query(User).count(),
        "tickets": db.query(Ticket).count(),
    }


@app.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    token = create_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "role": user.role}


@app.get("/tickets")
def list_tickets(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    # TODO: add filters later
    return db.query(Ticket).all()
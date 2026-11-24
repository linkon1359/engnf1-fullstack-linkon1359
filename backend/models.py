from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="USER", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    tickets = relationship("Ticket", back_populates="assignee")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(50), unique=True, index=True, nullable=True)
    subject = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    auto_category = Column(String(80), default="General", nullable=False)
    category = Column(String(80), default="General", nullable=False)
    is_human_override = Column(Boolean, default=False, nullable=False)
    priority = Column(String(20), default="MEDIUM", nullable=False)
    status = Column(String(20), default="OPEN", nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_reviewed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    assignee = relationship("User", back_populates="tickets")
    events = relationship("TicketEvent", back_populates="ticket", cascade="all, delete-orphan")


class TicketEvent(Base):
    __tablename__ = "ticket_events"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    field = Column(String(50), nullable=False)
    old_value = Column(String(255), nullable=True)
    new_value = Column(String(255), nullable=True)
    actor = Column(String(120), default="system", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    ticket = relationship("Ticket", back_populates="events")
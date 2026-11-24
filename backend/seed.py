from backend.auth import hash_password
from database import Base, SessionLocal, engine
from backend.models import Ticket, User


Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    admin = db.query(User).filter(User.email == "admin@triagesync.test").first()
    if not admin:
        admin = User(
            name="Admin Lead",
            email="admin@triagesync.test",
            password_hash=hash_password("Admin@123"),
            role="ADMIN",
        )
        db.add(admin)

    normal_user = db.query(User).filter(User.email == "user@triagesync.test").first()
    if not normal_user:
        normal_user = User(
            name="Agent Demo",
            email="user@triagesync.test",
            password_hash=hash_password("User@123"),
            role="USER",
        )
        db.add(normal_user)

    db.commit()

    tickets = [
        Ticket(external_id="TKT-101", subject="Login page throwing 500 error", body="Users cannot log in after recent update.", auto_category="BUG", category="BUG", is_human_override=False, priority="HIGH", status="OPEN", is_reviewed=False),
        Ticket(external_id="TKT-102", subject="Refund request for duplicate charge", body="Customer requested refund on billing charge.", auto_category="BILLING", category="BILLING", is_human_override=False, priority="HIGH", status="OPEN", is_reviewed=False),
        Ticket(external_id="TKT-103", subject="My package has not arrived", body="Shipment tracking has not moved.", auto_category="DELIVERY", category="DELIVERY", is_human_override=False, priority="HIGH", status="IN_PROGRESS", is_reviewed=True),
        Ticket(external_id="TKT-104", subject="Locked out of account", body="User is locked out and cannot sign in.", auto_category="LOGIN", category="LOGIN", is_human_override=False, priority="URGENT", status="OPEN", is_reviewed=False),
        Ticket(external_id="TKT-105", subject="Need CSV export option", body="Requesting feature to export tickets.", auto_category="FEATURE_REQUEST", category="FEATURE_REQUEST", is_human_override=False, priority="LOW", status="OPEN", is_reviewed=False),
        Ticket(external_id="TKT-106", subject="Production down on API", body="Production down with 500 error.", auto_category="BUG", category="BUG", is_human_override=False, priority="URGENT", status="IN_PROGRESS", is_reviewed=True),
        Ticket(external_id="TKT-107", subject="<script>alert('xss')</script> Invoice question", body="Question about monthly invoice.", auto_category="BILLING", category="BILLING", is_human_override=False, priority="MEDIUM", status="OPEN", is_reviewed=False),
        Ticket(external_id="TKT-108", subject="Password reset not working", body="Password reset link expired.", auto_category="LOGIN", category="LOGIN", is_human_override=False, priority="MEDIUM", status="RESOLVED", is_reviewed=True),
        Ticket(external_id="TKT-109", subject="Delivery delay on order", body="Package delivery is delayed.", auto_category="DELIVERY", category="DELIVERY", is_human_override=False, priority="MEDIUM", status="OPEN", is_reviewed=False),
        Ticket(external_id="TKT-110", subject="Add dark theme toggle", body="Feature request for dark theme.", auto_category="FEATURE_REQUEST", category="FEATURE_REQUEST", is_human_override=False, priority="LOW", status="OPEN", is_reviewed=False),
        Ticket(external_id="TKT-111", subject="Payment failed on checkout", body="Card payment failed during checkout.", auto_category="BILLING", category="BILLING", is_human_override=False, priority="MEDIUM", status="OPEN", is_reviewed=False),
        Ticket(external_id="TKT-112", subject="App crash on open", body="App crashes when opened.", auto_category="BUG", category="BUG", is_human_override=False, priority="HIGH", status="OPEN", is_reviewed=False),
        Ticket(external_id="TKT-113", subject="2FA code not received", body="2FA sign in code did not arrive.", auto_category="LOGIN", category="LOGIN", is_human_override=False, priority="MEDIUM", status="OPEN", is_reviewed=False),
        Ticket(external_id="TKT-114", subject="Wrong item in package", body="Received wrong item in delivery.", auto_category="DELIVERY", category="DELIVERY", is_human_override=False, priority="MEDIUM", status="OPEN", is_reviewed=False),
        Ticket(external_id="TKT-115", subject="Bulk status update", body="Requesting bulk status update action.", auto_category="FEATURE_REQUEST", category="FEATURE_REQUEST", is_human_override=False, priority="LOW", status="CLOSED", is_reviewed=True),
    ]
    for t in tickets:
        if not db.query(Ticket).filter(Ticket.external_id == t.external_id).first():
            db.add(t)

    db.commit()
    print("Seeded TriageSync data")
finally:
    db.close()
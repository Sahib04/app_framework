#!/usr/bin/env python3
"""
Create Default Users Utility

This will create one Admin, one Teacher, one Student, and one Parent user
directly in the PostgreSQL database used by the app.

- Reads DB settings from environment variables when available; falls back to provided defaults
- Hashes passwords with bcrypt
- Inserts into the "users" table with the exact column names expected by Sequelize (quoted camelCase)
"""

import os
import sys
import psycopg2
import bcrypt
from datetime import datetime

DEFAULTS = {
    "host": "dpg-d2feoiruibrs739se2lg-a.singapore-postgres.render.com",
    "database": "app_db_321n",
    "user": "app_db_321n_user",
    "password": "CRjBloZDcIp0ohrQVxNjE0h1s0vEK9L2",
    "port": 5432,
}

def get_db_config():
    dsn = os.getenv("DATABASE_URL")
    if dsn:
        return dsn
    return {
        "host": os.getenv("PGHOST", DEFAULTS["host"]),
        "database": os.getenv("PGDATABASE", DEFAULTS["database"]),
        "user": os.getenv("PGUSER", DEFAULTS["user"]),
        "password": os.getenv("PGPASSWORD", DEFAULTS["password"]),
        "port": int(os.getenv("PGPORT", DEFAULTS["port"])),
    }

def hash_password(raw: str) -> str:
    return bcrypt.hashpw(raw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def email_exists(cur, email: str) -> bool:
    cur.execute("SELECT 1 FROM users WHERE email = %s LIMIT 1", (email,))
    return cur.fetchone() is not None

def create_user(conn, *, role: str, first: str, last: str, email: str, password: str,
                phone: str | None = None,
                verified: bool = True,
                active: bool = True,
                student_id: str | None = None,
                grade: str | None = None,
                section: str | None = None,
                enrollment_date: str | None = None,
                department: str | None = None,
                specialization: str | None = None):
    if role not in ("admin", "teacher", "student", "parent"):
        raise ValueError("role must be one of: admin, teacher, student, parent")

    hashed = hash_password(password)
    with conn.cursor() as cur:
        if email_exists(cur, email):
            print(f"⚠️ Skipped {role}: {email} (already exists)")
            return None

        enroll_date_val = None
        if enrollment_date:
            try:
                enroll_date_val = datetime.fromisoformat(enrollment_date).date()
            except Exception:
                raise ValueError("enrollment_date must be ISO date (YYYY-MM-DD)")

        cur.execute(
            """
            INSERT INTO users (
              "firstName", "lastName", email, password, role, phone,
              "isEmailVerified", "isActive", department, specialization,
              "studentId", grade, section, "enrollmentDate"
            ) VALUES (
              %s, %s, %s, %s, %s, %s,
              %s, %s, %s, %s,
              %s, %s, %s, %s
            ) RETURNING id
            """,
            (
                first, last, email, hashed, role, phone,
                verified, active, department, specialization,
                student_id, grade, section, enroll_date_val
            ),
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        print(f"✅ Created {role}: {email} (id={user_id})")
        return user_id

def main():
    cfg = get_db_config()
    try:
        if isinstance(cfg, str):
            conn = psycopg2.connect(cfg)
        else:
            conn = psycopg2.connect(**cfg)
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        sys.exit(1)

    try:
        # Default test users
        users = [
            {
                "role": "admin",
                "first": "Super",
                "last": "Admin",
                "email": "admin@school.com",
                "password": "admin123",
            },
            {
                "role": "teacher",
                "first": "Jane",
                "last": "Doe",
                "email": "teacher@school.com",
                "password": "teacher123",
                "department": "Science",
                "specialization": "Physics",
            },
            {
                "role": "student",
                "first": "Alex",
                "last": "Smith",
                "email": "student@school.com",
                "password": "student123",
                "student_id": "20240001",
                "grade": "10",
                "section": "A",
                "enrollment_date": "2025-08-20",
            },
            {
                "role": "parent",
                "first": "Bob",
                "last": "Brown",
                "email": "parent@school.com",
                "password": "parent123",
            },
        ]

        for u in users:
            create_user(conn, **u)

        print("\n🎉 All default test users created successfully!\n")
        print("Login credentials:")
        print("  Admin   → admin@school.com / admin123")
        print("  Teacher → teacher@school.com / teacher123")
        print("  Student → student@school.com / student123")
        print("  Parent  → parent@school.com / parent123")

    except Exception as e:
        conn.rollback()
        print(f"❌ Failed to create users: {e}")
        sys.exit(2)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
import psycopg2
from datetime import datetime, timedelta
import uuid

# Database connection
conn = psycopg2.connect(
    host="dpg-d2feoiruibrs739se2lg-a.singapore-postgres.render.com",
    database="app_db_321n",
    user="app_db_321n_user",
    password="CRjBloZDcIp0ohrQVxNjE0h1s0vEK9L2",
    port=5432
)

cur = conn.cursor()

try:
    print("🔧 Setting up database tables...")
    
    # Check if users table exists
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'users'
        );
    """)
    
    users_table_exists = cur.fetchone()[0]
    
    if not users_table_exists:
        print("❌ Users table not found. Creating basic users table...")
        
        # Create basic users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "firstName" VARCHAR(50) NOT NULL,
                "lastName" VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                phone VARCHAR(20),
                role VARCHAR(20) DEFAULT 'student',
                "isActive" BOOLEAN DEFAULT true,
                "isEmailVerified" BOOLEAN DEFAULT false,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Insert a basic admin user
        admin_password = "admin123"  # In production, use proper hashing
        cur.execute("""
            INSERT INTO users (id, "firstName", "lastName", email, password, role)
            VALUES (gen_random_uuid(), 'Admin', 'User', 'admin@school.com', %s, 'admin')
            ON CONFLICT (email) DO NOTHING;
        """, (admin_password,))
        
        print("✅ Users table created with admin user")
    else:
        print("✅ Users table already exists")
    
    # Check if tests table exists
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'tests'
        );
    """)
    
    tests_table_exists = cur.fetchone()[0]
    
    if not tests_table_exists:
        print("❌ Tests table not found. Creating tests table...")
        
        # Create tests table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                subject VARCHAR(100) NOT NULL,
                topic TEXT NOT NULL,
                "totalMarks" INTEGER NOT NULL,
                duration INTEGER NOT NULL,
                "announcementDate" TIMESTAMP NOT NULL,
                "conductDate" TIMESTAMP NOT NULL,
                status VARCHAR(20) DEFAULT 'upcoming',
                instructions TEXT,
                "isActive" BOOLEAN DEFAULT true,
                "teacherId" UUID REFERENCES users(id),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        print("✅ Tests table created")
    else:
        print("✅ Tests table already exists")
    
    # Check if test_comments table exists
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'test_comments'
        );
    """)
    
    comments_table_exists = cur.fetchone()[0]
    
    if not comments_table_exists:
        print("❌ Test comments table not found. Creating test_comments table...")
        
        # Create test_comments table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS test_comments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                content TEXT NOT NULL,
                "isTeacherReply" BOOLEAN DEFAULT false,
                "isActive" BOOLEAN DEFAULT true,
                "testId" UUID REFERENCES tests(id),
                "userId" UUID REFERENCES users(id),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        print("✅ Test comments table created")
    else:
        print("✅ Test comments table already exists")
    
    # Check if test_submissions table exists
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'test_submissions'
        );
    """)
    
    submissions_table_exists = cur.fetchone()[0]
    
    if not submissions_table_exists:
        print("❌ Test submissions table not found. Creating test_submissions table...")
        
        # Create test_submissions table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS test_submissions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "submittedAt" TIMESTAMP NOT NULL,
                score INTEGER,
                status VARCHAR(20) DEFAULT 'submitted',
                feedback TEXT,
                "isActive" BOOLEAN DEFAULT true,
                "testId" UUID REFERENCES tests(id),
                "studentId" UUID REFERENCES users(id),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        print("✅ Test submissions table created")
    else:
        print("✅ Test submissions table already exists")
    
    conn.commit()
    print("🎉 Database setup completed successfully!")
    
    # Show table status
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'tests', 'test_comments', 'test_submissions')
        ORDER BY table_name;
    """)
    
    tables = cur.fetchall()
    print(f"📊 Available tables: {[table[0] for table in tables]}")

except Exception as e:
    print(f"❌ Error setting up database: {e}")
    conn.rollback()
finally:
    cur.close()
    conn.close()

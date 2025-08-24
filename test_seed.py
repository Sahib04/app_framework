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
    # Create test tables if they don't exist
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "Tests" (
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
            "teacherId" UUID REFERENCES "Users"(id),
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS "TestComments" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            content TEXT NOT NULL,
            "isTeacherReply" BOOLEAN DEFAULT false,
            "isActive" BOOLEAN DEFAULT true,
            "testId" UUID REFERENCES "Tests"(id),
            "userId" UUID REFERENCES "Users"(id),
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS "TestSubmissions" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "submittedAt" TIMESTAMP NOT NULL,
            score INTEGER,
            status VARCHAR(20) DEFAULT 'submitted',
            feedback TEXT,
            "isActive" BOOLEAN DEFAULT true,
            "testId" UUID REFERENCES "Tests"(id),
            "studentId" UUID REFERENCES "Users"(id),
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Get teacher and student IDs
    cur.execute('SELECT id FROM "Users" WHERE role = \'teacher\' LIMIT 1;')
    teacher_result = cur.fetchone()
    
    cur.execute('SELECT id FROM "Users" WHERE role = \'student\' LIMIT 1;')
    student_result = cur.fetchone()
    
    if teacher_result and student_result:
        teacher_id = teacher_result[0]
        student_id = student_result[0]
        
        # Create sample tests
        now = datetime.now()
        
        # Upcoming test
        upcoming_test = (
            str(uuid.uuid4()),
            'Mathematics Midterm',
            'Mathematics',
            'Algebra and Calculus fundamentals including linear equations, derivatives, and basic integration',
            50,
            90,
            now,
            now + timedelta(days=7),
            'upcoming',
            'Bring calculator and show all work. No phones allowed.',
            True,
            teacher_id
        )
        
        # Active test
        active_test = (
            str(uuid.uuid4()),
            'Physics Quiz',
            'Physics',
            'Mechanics: Newton\'s laws, momentum, and energy conservation',
            25,
            45,
            now - timedelta(days=1),
            now + timedelta(hours=2),
            'active',
            'Multiple choice questions. Choose the best answer.',
            True,
            teacher_id
        )
        
        # Completed test
        completed_test = (
            str(uuid.uuid4()),
            'English Literature Final',
            'English',
            'Shakespeare\'s Hamlet: themes, character analysis, and literary devices',
            100,
            120,
            now - timedelta(days=5),
            now - timedelta(days=3),
            'completed',
            'Essay format. Support your arguments with textual evidence.',
            True,
            teacher_id
        )
        
        # Insert tests
        cur.execute("""
            INSERT INTO "Tests" (id, title, subject, topic, "totalMarks", duration, 
                               "announcementDate", "conductDate", status, instructions, 
                               "isActive", "teacherId")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """, upcoming_test)
        
        cur.execute("""
            INSERT INTO "Tests" (id, title, subject, topic, "totalMarks", duration, 
                               "announcementDate", "conductDate", status, instructions, 
                               "isActive", "teacherId")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """, active_test)
        
        cur.execute("""
            INSERT INTO "Tests" (id, title, subject, topic, "totalMarks", duration, 
                               "announcementDate", "conductDate", status, instructions, 
                               "isActive", "teacherId")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """, completed_test)
        
        # Get test IDs for comments and submissions
        cur.execute('SELECT id FROM "Tests" WHERE title = \'Mathematics Midterm\';')
        upcoming_test_id = cur.fetchone()[0]
        
        cur.execute('SELECT id FROM "Tests" WHERE title = \'Physics Quiz\';')
        active_test_id = cur.fetchone()[0]
        
        cur.execute('SELECT id FROM "Tests" WHERE title = \'English Literature Final\';')
        completed_test_id = cur.fetchone()[0]
        
        # Create sample comments
        comments = [
            (str(uuid.uuid4()), 'Can we use calculators for the algebra section?', False, upcoming_test_id, student_id),
            (str(uuid.uuid4()), 'Yes, calculators are allowed for all sections. Make sure to show your work though.', True, upcoming_test_id, teacher_id),
            (str(uuid.uuid4()), 'What topics should I focus on most?', False, upcoming_test_id, student_id),
            (str(uuid.uuid4()), 'Focus on derivatives and basic integration. The algebra section is straightforward.', True, upcoming_test_id, teacher_id),
        ]
        
        for comment in comments:
            cur.execute("""
                INSERT INTO "TestComments" (id, content, "isTeacherReply", "testId", "userId")
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING;
            """, comment)
        
        # Create sample submissions
        submissions = [
            (str(uuid.uuid4()), now - timedelta(hours=1), 18, 'graded', 'Good work on mechanics. Review energy conservation.', active_test_id, student_id),
            (str(uuid.uuid4()), now - timedelta(days=2), 85, 'graded', 'Excellent analysis of Hamlet\'s character development.', completed_test_id, student_id),
        ]
        
        for submission in submissions:
            cur.execute("""
                INSERT INTO "TestSubmissions" (id, "submittedAt", score, status, feedback, "testId", "studentId")
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING;
            """, submission)
        
        conn.commit()
        print("✅ Test data seeded successfully!")
        print(f"   - Created 3 tests (upcoming, active, completed)")
        print(f"   - Added 4 comments with teacher replies")
        print(f"   - Added 2 test submissions with grades")
        
    else:
        print("❌ No teacher or student found in database")
        print("   Please run the user setup first")

except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    cur.close()
    conn.close()

import psycopg2

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
    print("🔍 Checking database for tests...")
    
    # Check if tests table exists
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'tests'
        );
    """)
    
    tests_table_exists = cur.fetchone()[0]
    print(f"✅ Tests table exists: {tests_table_exists}")
    
    if tests_table_exists:
        # Count tests
        cur.execute("SELECT COUNT(*) FROM tests;")
        test_count = cur.fetchone()[0]
        print(f"📊 Total tests in database: {test_count}")
        
        if test_count > 0:
            # Show test details
            cur.execute("""
                SELECT id, title, subject, status, "conductDate", "teacherId"
                FROM tests 
                ORDER BY "conductDate" DESC 
                LIMIT 5;
            """)
            
            tests = cur.fetchall()
            print("\n📝 Recent tests:")
            for test in tests:
                print(f"  - {test[1]} ({test[2]}) - Status: {test[3]} - Date: {test[4]}")
        else:
            print("❌ No tests found in database")
            
            # Check if there are teachers to create tests
            cur.execute("SELECT COUNT(*) FROM users WHERE role = 'teacher';")
            teacher_count = cur.fetchone()[0]
            print(f"👨‍🏫 Teachers available: {teacher_count}")
            
            if teacher_count > 0:
                print("💡 You can create tests using the teacher account")
    
    # Check users table
    cur.execute("SELECT COUNT(*) FROM users;")
    user_count = cur.fetchone()[0]
    print(f"\n👥 Total users: {user_count}")
    
    # Check user roles
    cur.execute("""
        SELECT role, COUNT(*) 
        FROM users 
        GROUP BY role;
    """)
    
    roles = cur.fetchall()
    print("\n👤 Users by role:")
    for role, count in roles:
        print(f"  - {role}: {count}")

except Exception as e:
    print(f"❌ Error checking database: {e}")
finally:
    cur.close()
    conn.close()

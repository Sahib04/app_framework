import os
from sqlalchemy import create_engine
import pandas as pd

# Database connection
engine = create_engine(
    "postgresql+psycopg2://app_db_321n_user:CRjBloZDcIp0ohrQVxNjE0h1s0vEK9L2@dpg-d2feoiruibrs739se2lg-a.singapore-postgres.render.com:5432/app_db_321n"
)

# Folder to save tables
output_folder = "db_exports"
os.makedirs(output_folder, exist_ok=True)

# Get table names
tables = pd.read_sql("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
""", engine)

# Export each table as CSV
for table in tables['table_name']:
    df = pd.read_sql(f'SELECT * FROM "{table}"', engine)
    file_path = os.path.join(output_folder, f"{table}.csv")
    df.to_csv(file_path, index=False)
    print(f"✅ Saved {table} → {file_path}")
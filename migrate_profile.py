from sqlalchemy import text
from app.database import engine

def migrate():
    with engine.begin() as conn:
        print("Migrating users table...")
        
        # We catch exceptions internally if the column already exists
        columns = [
            ("full_name", "VARCHAR(255)"),
            ("profile_picture_url", "VARCHAR(1024)"),
            ("business_name", "VARCHAR(255)"),
            ("business_type", "VARCHAR(100)")
        ]
        
        for col_name, col_type in columns:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                print(f"Added {col_name} successfully.")
            except Exception as e:
                # Often throws UniqueViolation or similar if col exists
                print(f"Column {col_name} might already exist or error: {e}")

if __name__ == "__main__":
    migrate()

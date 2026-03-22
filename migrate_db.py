from sqlalchemy import text
from app.database import engine

def run_migration():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local' NOT NULL;"))
            print("Added auth_provider column.")
        except Exception as e:
            print(f"auth_provider might already exist: {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255);"))
            conn.execute(text("CREATE UNIQUE INDEX ix_users_google_id ON users (google_id);"))
            print("Added google_id column and index.")
        except Exception as e:
            print(f"google_id might already exist: {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;"))
            print("Dropped NOT NULL constraint on hashed_password.")
        except Exception as e:
            print(f"hashed_password nullable mod failed: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(255);"))
            print("Added full_name column.")
        except Exception as e:
            print(f"full_name might already exist: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR(1024);"))
            print("Added profile_picture_url column.")
        except Exception as e:
            print(f"profile_picture_url might already exist: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN business_name VARCHAR(255);"))
            print("Added business_name column.")
        except Exception as e:
            print(f"business_name might already exist: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN business_type VARCHAR(100);"))
            print("Added business_type column.")
        except Exception as e:
            print(f"business_type might already exist: {e}")

if __name__ == "__main__":
    run_migration()
    print("Migration script executed!")

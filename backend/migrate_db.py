import os
import subprocess
import pymysql
import sys

def main():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(backend_dir, 'db.sqlite3')
    
    if not os.path.exists(db_path):
        print(f"SQLite DB not found at {db_path}. Skipping backup and migrating empty schema...")
        has_sqlite = False
    else:
        has_sqlite = True

    # Prepare SQLite environment URL
    normalized_path = db_path.replace('\\', '/')
    sqlite_url = f"sqlite:///{normalized_path}"
    sqlite_env = os.environ.copy()
    sqlite_env['DATABASE_URL'] = sqlite_url

    # Step 1: Ensure SQLite database is fully migrated to the latest model state
    if has_sqlite:
        print("Step 1a: Generating new migrations...")
        try:
            subprocess.run([sys.executable, 'manage.py', 'makemigrations'], check=True)
            print("Step 1b: Applying migrations to SQLite database to align schema...")
            subprocess.run([sys.executable, 'manage.py', 'migrate'], env=sqlite_env, check=True)
        except Exception as e:
            print(f"Error preparing SQLite schema: {e}")
            sys.exit(1)

        print("Step 1c: Dumping existing SQLite data...")
        datadump_path = os.path.join(backend_dir, 'datadump.json')
        try:
            with open(datadump_path, 'w', encoding='utf-8') as f:
                subprocess.run(
                    [
                        sys.executable, 'manage.py', 'dumpdata',
                        '--natural-foreign', '--natural-primary',
                        '-e', 'contenttypes',
                        '-e', 'auth.Permission',
                        '--indent', '4'
                    ],
                    env=sqlite_env,
                    stdout=f,
                    check=True
                )
            print(f"SQLite data successfully dumped to {datadump_path}")
        except Exception as e:
            print(f"Error dumping SQLite data: {e}")
            sys.exit(1)

    # Step 2: Create MySQL database if it doesn't exist
    print("Step 2: Connecting to MySQL server and creating database 'car_inspection' if it doesn't exist...")
    try:
        connection = pymysql.connect(
            host='127.0.0.1',
            port=3306,
            user='root',
            password='root',
            charset='utf8mb4'
        )
        with connection.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS car_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        connection.commit()
        connection.close()
        print("Database 'car_inspection' checked/created successfully.")
    except Exception as e:
        print(f"Error connecting to MySQL or creating database: {e}")
        print("Please make sure your MySQL server is running locally on 127.0.0.1:3306 with username 'root' and password 'root'.")
        sys.exit(1)

    # Step 3: Run migrations on MySQL
    print("Step 3: Applying migrations to MySQL database...")
    try:
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        print("Migrations applied successfully to MySQL.")
    except Exception as e:
        print(f"Error applying migrations to MySQL: {e}")
        sys.exit(1)

    # Step 4: Restore dumped data into MySQL database
    if has_sqlite:
        print("Step 4: Restoring SQLite data dump into MySQL...")
        datadump_path = os.path.join(backend_dir, 'datadump.json')
        try:
            subprocess.run([sys.executable, 'manage.py', 'loaddata', 'datadump.json'], check=True)
            print("Data successfully restored from SQLite to MySQL database!")
        except Exception as e:
            print(f"Error restoring data into MySQL: {e}")
            sys.exit(1)
            
    print("\nDatabase migration process completed successfully!")

if __name__ == '__main__':
    main()

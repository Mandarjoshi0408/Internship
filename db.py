import mysql.connector
from mysql.connector import Error

def get_db_connection():
    """
    Establishes and returns a connection to the MySQL database.
    Returns None if the connection fails.
    """
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='internship', # <-- UPDATE THIS
            user='root',                   # <-- UPDATE THIS
            password='1234567890'         # <-- UPDATE THIS
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return None
import sqlite3
import os

password = "admin123"
secret_key = "sk-12345-abcde"

def get_user(user_input):
    conn = sqlite3.connect("app.db")
    query = "SELECT * FROM users WHERE name = '" + user_input + "'"
    conn.execute(query)

def run_command(cmd):
    os.system(cmd)

eval(input("Enter expression: "))

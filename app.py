import os
import cv2
import numpy as np
import base64
import pandas as pd
from io import StringIO, BytesIO
from fastapi import FastAPI, HTTPException, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from insightface.app import FaceAnalysis
from db import get_db_connection
from fpdf import FPDF # Ensure you ran: pip install fpdf

app = FastAPI()

# --- 1. DIRECTORIES & CONFIG (Preserved) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "captured_faces")
DOCS_DIR = os.path.join(BASE_DIR, "student_documents")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)

# AI Face Model initialization
face_app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=0, det_size=(640, 640))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. DATA MODELS (Preserved) ---
class LoginRequest(BaseModel):
    email: str
    password: str

class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    pin: str
    marks: int
    grade: str

# --- 3. STARTUP REPAIR (Preserved) ---
@app.on_event("startup")
def startup_db_check():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE students MODIFY enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
        cursor.execute("ALTER TABLE students MODIFY user_id INT NULL")
        cursor.execute("ALTER TABLE students MODIFY pin VARCHAR(20) DEFAULT '1234'")
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ DATABASE STRUCTURE VERIFIED")
    except Exception as e:
        print(f"Startup Fix: {e}")

# --- 4. AUTH ROUTES 
@app.post("/login")
def login(data: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Admin Check
    cursor.execute("SELECT username, password_hash, role FROM users WHERE username = %s", (data.email,))
    user = cursor.fetchone()
    if user and user['password_hash'] == data.password:
        return {"role": user['role'], "status": "success"}

    # Student Check
    cursor.execute("SELECT id, email, pin FROM students WHERE email = %s", (data.email,))
    student = cursor.fetchone()
    conn.close()
    
    if student and str(student['pin']) == str(data.password):
        return {"role": "student", "student_id": student['id'], "status": "success"}
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

# --- 5. DATA & GRAPH ROUTES (Preserved Selective Selection) ---
@app.get("/students")
def get_all_students():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # We select marks here so your React Charts can use the data
    cursor.execute("SELECT id, first_name, last_name, email, marks, grade FROM students ORDER BY id DESC")
    res = cursor.fetchall()
    conn.close()
    return res

@app.get("/students/{student_id}")
def get_single_student(student_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # Exclude face_embedding to avoid the 500 Unicode error
    cursor.execute("""
        SELECT id, first_name, last_name, email, pin, marks, grade, enrollment_date 
        FROM students WHERE id = %s
    """, (student_id,))
    student = cursor.fetchone()
    conn.close()
    if not student: raise HTTPException(status_code=404)
    return student

# --- 6. NEW: FILE UPLOAD & PDF GENERATION ---
@app.post("/upload-doc/{student_id}")
async def upload_document(student_id: int, file: UploadFile = File(...)):
    """Upload documents in any format (pdf, jpg, docx, etc.)"""
    ext = file.filename.split(".")[-1]
    file_path = os.path.join(DOCS_DIR, f"student_{student_id}_file.{ext}")
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    return {"status": "success", "message": f"Saved as student_{student_id}_file.{ext}"}

@app.get("/download-pdf/{student_id}")
def download_pdf(student_id: int):
    """Generates a PDF Report card for the student"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM students WHERE id = %s", (student_id,))
    s = cursor.fetchone()
    conn.close()
    
    if not s: raise HTTPException(status_code=404)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 20)
    pdf.cell(200, 20, txt="ACADEMIC PERFORMANCE REPORT", ln=True, align='C')
    pdf.ln(10)
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Student ID: {s['id']}", ln=True)
    pdf.cell(200, 10, txt=f"Full Name: {s['first_name']} {s['last_name']}", ln=True)
    pdf.cell(200, 10, txt=f"Email: {s['email']}", ln=True)
    pdf.cell(200, 10, txt=f"Marks: {s['marks']}", ln=True)
    pdf.cell(200, 10, txt=f"Grade: {s['grade']}", ln=True)
    
    pdf_output = BytesIO()
    pdf_str = pdf.output(dest='S').encode('latin-1')
    pdf_output.write(pdf_str)
    pdf_output.seek(0)
    
    return StreamingResponse(
        pdf_output, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=Student_{student_id}_Report.pdf"}
    )

# --- 7. CRUD OPERATIONS (Preserved) ---
@app.post("/students")
def add_student(s: StudentCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "INSERT INTO students (first_name, last_name, email, pin, marks, grade) VALUES (%s,%s,%s,%s,%s,%s)"
    cursor.execute(sql, (s.first_name, s.last_name, s.email, s.pin, s.marks, s.grade))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.put("/students/{student_id}")
def update_student(student_id: int, s: StudentCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "UPDATE students SET first_name=%s, last_name=%s, email=%s, pin=%s, marks=%s, grade=%s WHERE id=%s"
    cursor.execute(sql, (s.first_name, s.last_name, s.email, s.pin, s.marks, s.grade, student_id))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.delete("/students/{student_id}")
def delete_student(student_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM students WHERE id = %s", (student_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

# --- 8. FACE AI ENROLLMENT (Preserved) ---
@app.post("/enroll-face/{student_id}")
async def enroll_face(student_id: int, payload: dict = Body(...)):
    img_b64 = payload.get('image')
    if "," in img_b64: img_b64 = img_b64.split(",")[1]
    img = cv2.imdecode(np.frombuffer(base64.b64decode(img_b64), np.uint8), cv2.IMREAD_COLOR)
    faces = face_app.get(img)
    if not faces: raise HTTPException(status_code=400, detail="No face detected")
    embedding = faces[0].normed_embedding.tobytes()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE students SET face_embedding = %s WHERE id = %s", (embedding, student_id))
    conn.commit()
    conn.close()
    return {"status": "success"}

# --- 9. CSV EXPORT (Preserved) ---
@app.get("/export-students")
def export_students():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT first_name, last_name, email, marks, grade FROM students")
    df = pd.DataFrame(cursor.fetchall())
    conn.close()
    output = StringIO()
    df.to_csv(output, index=False)
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="text/csv", 
        headers={"Content-Disposition": "attachment; filename=report.csv"}
    )

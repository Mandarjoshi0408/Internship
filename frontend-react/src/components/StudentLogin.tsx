import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { GraduationCap, User, Lock, ArrowRight } from 'lucide-react';

const StudentLogin = ({ setAuth }: { setAuth: any }) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Verifying credentials...");
    
    try {
      const res = await axios.post('http://localhost:8000/login', { 
        email: email, 
        password: pin 
      });

      if (res.data.status === 'success') {
        // --- THE CRITICAL FIX ---
        localStorage.setItem('role', res.data.role);
        if (res.data.student_id) {
          localStorage.setItem('student_id', res.data.student_id.toString());
        }
        // ------------------------

        toast.success("Welcome to your Portal!", { id: loadingToast });
        setAuth(res.data.role);
        navigate('/portal');
      }
    } catch (err: any) {
      toast.error("Invalid Email or PIN", { id: loadingToast });
      console.error("Login Error:", err);
    }
  };

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={styles.card}>
        <div style={styles.iconBox}><GraduationCap size={32} /></div>
        <h2 style={{ marginBottom: '10px' }}>Student Login</h2>
        <p style={styles.subText}>Sign in to view your profile and attendance</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputWrapper}>
            <User size={18} style={styles.inputIcon} />
            <input type="email" placeholder="Student Email" onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
          </div>
          <div style={styles.inputWrapper}>
            <Lock size={18} style={styles.inputIcon} />
            <input type="password" placeholder="4-Digit PIN" maxLength={4} onChange={(e) => setPin(e.target.value)} style={styles.input} required />
          </div>
          <button type="submit" style={styles.btn}>Enter Portal</button>
        </form>

        <div style={styles.switchBox}>
          <span>Not a student? </span>
          <Link to="/admin-login" style={styles.link}>Admin Login <ArrowRight size={14} /></Link>
        </div>
      </motion.div>
    </div>
  );
};

// Simple styles object to match your UI
const styles: any = {
  container: { height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#1e293b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px', textAlign: 'center' },
  iconBox: { background: '#3b82f6', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  subText: { color: '#94a3b8', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' },
  input: { width: '100%', padding: '12px 12px 12px 40px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' },
  btn: { padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  switchBox: { marginTop: '20px', fontSize: '14px', color: '#94a3b8' },
  link: { color: '#3b82f6', textDecoration: 'none', marginLeft: '5px' }
};

export default StudentLogin;
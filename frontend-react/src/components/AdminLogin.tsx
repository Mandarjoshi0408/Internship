import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, User, ArrowRight } from 'lucide-react';

const AdminLogin = ({ setAuth }: { setAuth: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const loading = toast.loading("Verifying Admin Identity...");

    try {
      const res = await axios.post('http://localhost:8000/login', {
        email: email,
        password: password
      });

      if (res.data.role === 'admin') {
        localStorage.setItem('role', 'admin');
        setAuth('admin'); 
        toast.success("Welcome back, Administrator", { id: loading });
        navigate('/');
      } else {
        toast.error("Access Denied: Not an Admin account", { id: loading });
      }
    } catch (err: any) {
      toast.error("Invalid Credentials", { id: loading });
    }
  };

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.card}>
        <div style={styles.iconBox}><ShieldCheck size={32} /></div>
        <h2 style={{ marginBottom: '10px' }}>Admin Access</h2>
        <p style={styles.subText}>Secure login for system management</p>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputWrapper}>
            <User size={18} style={styles.inputIcon}/>
            <input type="email" placeholder="Admin Email" onChange={e => setEmail(e.target.value)} style={styles.input} required />
          </div>
          <div style={styles.inputWrapper}>
            <Lock size={18} style={styles.inputIcon}/>
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={styles.input} required />
          </div>
          <button type="submit" style={styles.btn}>Unlock Dashboard</button>
        </form>

        <div style={styles.switchBox}>
          <span>Are you a student?</span>
          <Link to="/student-login" style={styles.link}>
            Student Portal <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const styles: any = {
  container: { height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  card: { background: '#16161e', padding: '40px', borderRadius: '32px', width: '380px', border: '1px solid #2e303e', textAlign: 'center' },
  iconBox: { width: '60px', height: '60px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderRadius: '15px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  subText: { color: '#64748b', fontSize: '0.85rem', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '15px', top: '15px', color: '#475569' },
  input: { width: '100%', padding: '15px 15px 15px 45px', background: '#0d0e14', border: '1px solid #2e303e', borderRadius: '12px', color: '#fff', outline: 'none', boxSizing: 'border-box' },
  btn: { padding: '15px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' },
  switchBox: { marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #1e1e26', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' },
  link: { color: '#6366f1', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }
};

export default AdminLogin;
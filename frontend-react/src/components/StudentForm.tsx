import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Save, ArrowLeft, Award, Percent } from 'lucide-react';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    pin: '1234', 
    marks: 0, 
    grade: 'F'
  });

  useEffect(() => {
    if (isEdit) {
      axios.get(`http://localhost:8000/students/${id}`)
        .then(res => setForm(res.data))
        .catch(() => toast.error("Could not fetch student data"));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const load = toast.loading("Processing...");
    try {
      if (isEdit) {
        await axios.put(`http://localhost:8000/students/${id}`, form);
      } else {
        // FIXED: Removed the trailing slash to match FastAPI
        await axios.post('http://localhost:8000/students', form);
      }
      toast.success("Saved successfully!", { id: load });
      navigate('/');
    } catch (error) { 
      toast.error("Submission failed!", { id: load }); 
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
      <button onClick={() => navigate('/')} style={styles.backBtn}>
        <ArrowLeft size={18} style={{ marginRight: '8px' }}/> Dashboard
      </button>
      
      <div style={styles.card}>
        <h2 style={{ marginBottom: '25px', color: '#fff' }}>
          {isEdit ? 'Update Student Record' : 'New Enrollment'}
        </h2>
        
        <form onSubmit={handleSubmit} style={styles.grid}>
          {/* Names */}
          <div style={styles.group}>
            <User size={18} style={styles.icon}/>
            <input 
              placeholder="First Name" 
              value={form.first_name} 
              onChange={e => setForm({...form, first_name: e.target.value})} 
              style={styles.input} 
              required
            />
          </div>
          <div style={styles.group}>
            <User size={18} style={styles.icon}/>
            <input 
              placeholder="Last Name" 
              value={form.last_name} 
              onChange={e => setForm({...form, last_name: e.target.value})} 
              style={styles.input} 
              required
            />
          </div>

          {/* Contact & Security */}
          <div style={styles.group}>
            <Mail size={18} style={styles.icon}/>
            <input 
              type="email" 
              placeholder="Email" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              style={styles.input} 
              required
            />
          </div>
          <div style={styles.group}>
            <Lock size={18} style={styles.icon}/>
            <input 
              placeholder="PIN" 
              value={form.pin} 
              onChange={e => setForm({...form, pin: e.target.value})} 
              style={styles.input} 
              required
            />
          </div>

          <div style={{ gridColumn: '1/-1', height: '1px', background: '#2e303e', margin: '10px 0' }}></div>

          {/* Academic Data */}
          <div style={styles.group}>
            <Percent size={18} style={styles.icon}/>
            <input 
              type="number" 
              placeholder="Marks" 
              value={form.marks} 
              onChange={e => setForm({...form, marks: parseInt(e.target.value) || 0})} 
              style={styles.input}
            />
          </div>

          <div style={styles.group}>
            {/* FIXED: Award icon is now a self-closing tag next to the select */}
            <Award size={18} style={styles.icon}/>
            <select 
              value={form.grade} 
              onChange={e => setForm({...form, grade: e.target.value})} 
              style={styles.input}
            >
              {['A+', 'A', 'B', 'C', 'F'].map(g => (
                <option key={g} value={g} style={{ background: '#0d0e14' }}>{g}</option>
              ))}
            </select>
          </div>

          <button type="submit" style={styles.btn}>
            <Save size={18} style={{ marginRight: '10px' }}/> Save Data
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: any = {
  card: { background: '#16161e', padding: '30px', borderRadius: '24px', border: '1px solid #2e303e' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  group: { position: 'relative' },
  icon: { 
    position: 'absolute', 
    left: '15px', 
    top: '16px', 
    color: '#6366f1', 
    zIndex: 5 
  },
  input: { 
    width: '100%', 
    padding: '15px 15px 15px 45px', 
    background: '#0d0e14', 
    color: '#fff', 
    border: '1px solid #2e303e', 
    borderRadius: '12px', 
    boxSizing: 'border-box',
    fontSize: '14px',
    outline: 'none'
  },
  btn: { 
    gridColumn: '1/-1', 
    background: '#6366f1', 
    color: '#fff', 
    padding: '15px', 
    border: 'none', 
    borderRadius: '12px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10px'
  },
  backBtn: { 
    background: 'none', 
    border: 'none', 
    color: '#94a3b8', 
    cursor: 'pointer', 
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px'
  }
};

export default StudentForm;
import { useState } from 'react';
import AdminLogin from './AdminLogin';
import StudentLogin from './StudentLogin';
import { ShieldCheck, GraduationCap } from 'lucide-react';

const UnifiedLogin = ({ setAuth }: { setAuth: any }) => {
  const [mode, setMode] = useState<'admin' | 'student'>('admin');

  return (
    <div style={styles.container}>
      <div style={styles.toggleWrapper}>
        <button 
          onClick={() => setMode('admin')} 
          style={{...styles.toggleBtn, background: mode === 'admin' ? '#6366f1' : 'transparent'}}
        >
          <ShieldCheck size={18} /> Admin
        </button>
        <button 
          onClick={() => setMode('student')} 
          style={{...styles.toggleBtn, background: mode === 'student' ? '#6366f1' : 'transparent'}}
        >
          <GraduationCap size={18} /> Student
        </button>
      </div>

      <div style={styles.formArea}>
        {mode === 'admin' ? (
          <AdminLogin setAuth={setAuth} />
        ) : (
          <StudentLogin setAuth={setAuth} />
        )}
      </div>
    </div>
  );
};

const styles: any = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '50px' },
  toggleWrapper: { display: 'flex', background: '#16161e', padding: '5px', borderRadius: '15px', marginBottom: '30px', border: '1px solid #2e303e' },
  toggleBtn: { border: 'none', color: '#fff', padding: '10px 25px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.3s', fontWeight: 600 },
  formArea: { width: '100%' }
};

export default UnifiedLogin;
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LogOut, LayoutDashboard, UserCircle } from 'lucide-react';

// Import all your components
import AdminLogin from './components/AdminLogin';
import StudentLogin from './components/StudentLogin';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import StudentPortal from './components/StudentPortal';

function App() {
  // Pull the role from localStorage so the user stays logged in on refresh
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    window.location.href = '/'; // Reset to home
  };

  return (
    <Router>
      <div style={styles.layout}>
        <Toaster position="top-right" />
        
        {/* SHARED HEADER: Adapts based on Role */}
        {role && (
          <header style={styles.header}>
            <div style={styles.logoGroup}>
              <div style={styles.logo}>{role === 'admin' ? 'A' : 'S'}</div>
              <h2 style={{fontSize: '1.1rem', margin: 0}}>
                {role === 'admin' ? 'Admin Control' : 'Student Portal'}
              </h2>
            </div>
            <nav style={styles.nav}>
              {role === 'admin' ? (
                <Link to="/" style={styles.navLink}><LayoutDashboard size={18}/> Directory</Link>
              ) : (
                <Link to="/portal" style={styles.navLink}><UserCircle size={18}/> My Dashboard</Link>
              )}
              <button onClick={handleLogout} style={styles.logoutBtn}>
                <LogOut size={16}/> Logout
              </button>
            </nav>
          </header>
        )}

        <main style={styles.main}>
          <Routes>
            {/* 1. AUTH ROUTES */}
            <Route 
              path="/admin-login" 
              element={!role ? <AdminLogin setAuth={setRole} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/student-login" 
              element={!role ? <StudentLogin setAuth={setRole} /> : <Navigate to="/portal" />} 
            />

            {/* 2. ADMIN PROTECTED ROUTES */}
            <Route 
              path="/" 
              element={role === 'admin' ? <StudentList /> : <Navigate to="/admin-login" />} 
            />
            <Route 
              path="/add" 
              element={role === 'admin' ? <StudentForm /> : <Navigate to="/admin-login" />} 
            />
            <Route 
              path="/edit/:id" 
              element={role === 'admin' ? <StudentForm /> : <Navigate to="/admin-login" />} 
            />

            {/* 3. STUDENT PROTECTED ROUTES */}
            <Route 
              path="/portal" 
              element={role === 'student' ? <StudentPortal /> : <Navigate to="/student-login" />} 
            />

            {/* 4. CATCH-ALL REDIRECT */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const styles: any = {
  layout: { 
    background: '#0d0e14', 
    color: '#fff', 
    minHeight: '100vh', 
    fontFamily: "'Inter', sans-serif" 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '15px 60px', 
    borderBottom: '1px solid #1e1e26', 
    background: '#16161e',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '15px' },
  logo: { 
    background: '#6366f1', 
    color: '#fff', 
    width: '32px', 
    height: '32px', 
    borderRadius: '8px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: 'bold' 
  },
  nav: { display: 'flex', alignItems: 'center', gap: '30px' },
  navLink: { 
    color: '#94a3b8', 
    textDecoration: 'none', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontSize: '0.9rem',
    fontWeight: 500
  },
  logoutBtn: { 
    background: 'rgba(244, 63, 94, 0.1)', 
    border: '1px solid rgba(244, 63, 94, 0.2)', 
    color: '#f43f5e', 
    padding: '8px 16px', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: '0.2s'
  },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }
};

export default App;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Edit3, Trash2, UserCheck, ShieldCheck, Search, Plus, Download } from 'lucide-react';
import BiometricCamera from './BiometricCamera';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [biometricTarget, setBiometricTarget] = useState<{id: number, type: 'enroll' | 'verify'} | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:8000/students/');
      setStudents(res.data);
    } catch (err) {
      toast.error("Failed to load students from MySQL");
    }
  };

  const handleDownloadCSV = async () => {
    const loading = toast.loading("Generating Student Report...");
    try {
      const response = await axios.get('http://localhost:8000/export-students', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Student_Directory_2026.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("CSV Downloaded Successfully", { id: loading });
    } catch (error) {
      toast.error("Could not download CSV", { id: loading });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this student?")) {
      try {
        await axios.delete(`http://localhost:8000/students/${id}`);
        toast.success("Record deleted");
        fetchStudents();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const filtered = students.filter((s: any) => 
    s.first_name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Student Directory</h1>
          <p style={styles.subtitle}>{students.length} Total Students Enrolled</p>
        </div>
        <div style={styles.actionRow}>
          <button onClick={handleDownloadCSV} style={styles.csvBtn}>
            <Download size={18} /> Export CSV
          </button>
          <div style={styles.searchBox}>
            <Search size={18} color="#64748b" />
            <input 
              placeholder="Search by name or email..." 
              onChange={(e) => setSearch(e.target.value)} 
              style={styles.searchInput} 
            />
          </div>
          <Link to="/add" style={styles.addBtn}>
            <Plus size={18} /> Add New
          </Link>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Student Details</th>
              <th style={styles.th}>Enrollment Date</th>
              <th style={styles.th}>PIN</th>
              <th style={styles.th}>Biometrics & Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s: any) => (
              <tr key={s.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={{fontWeight: 600}}>{s.first_name} {s.last_name}</div>
                  <div style={{color: '#64748b', fontSize: '0.8rem'}}>{s.email}</div>
                </td>
                <td style={styles.td}>{s.enrollment_date}</td>
                <td style={styles.td}><code style={styles.code}>{s.pin}</code></td>
                <td style={styles.td}>
                  <div style={styles.btnGroup}>
                    <button onClick={() => setBiometricTarget({id: s.id, type: 'enroll'})} style={styles.enrollBtn} title="Enroll Face"><UserCheck size={16}/></button>
                    <button onClick={() => setBiometricTarget({id: s.id, type: 'verify'})} style={styles.verifyBtn} title="Mark Attendance"><ShieldCheck size={16}/></button>
                    <div style={styles.divider}></div>
                    <Link to={`/edit/${s.id}`} style={styles.editBtn}><Edit3 size={16}/></Link>
                    <button onClick={() => handleDelete(s.id)} style={styles.delBtn}><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {biometricTarget && (
  <BiometricCamera
    studentId={biometricTarget.id}
    onClose={() => {
      setBiometricTarget(null);
      fetchStudents(); // Refresh the list to show updated status
    }}
  />
)}
    </div>
  );
};

const styles: any = {
  container: { background: '#16161e', padding: '30px', borderRadius: '28px', border: '1px solid #2e303e' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '1.5rem', margin: 0, fontWeight: 700 },
  subtitle: { color: '#64748b', fontSize: '0.85rem' },
  actionRow: { display: 'flex', gap: '15px', alignItems: 'center' },
  csvBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#94a3b8', border: '1px solid #2e303e', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  searchBox: { display: 'flex', alignItems: 'center', background: '#0d0e14', padding: '10px 15px', borderRadius: '12px', border: '1px solid #2e303e', width: '280px' },
  searchInput: { background: 'none', border: 'none', color: '#fff', marginLeft: '10px', outline: 'none', width: '100%' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff', padding: '10px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '15px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #2e303e' },
  td: { padding: '18px 15px', borderBottom: '1px solid #1e1e26' },
  code: { background: '#0d0e14', padding: '4px 8px', borderRadius: '6px', color: '#10b981' },
  btnGroup: { display: 'flex', gap: '8px' },
  divider: { width: '1px', height: '20px', background: '#2e303e' },
  enrollBtn: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
  verifyBtn: { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
  editBtn: { color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' },
  delBtn: { color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer' }
};

export default StudentList;
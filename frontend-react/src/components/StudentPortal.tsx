import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Upload, TrendingUp, Download, UserCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'react-hot-toast';

const StudentPortal = () => {
  const [student, setStudent] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const sId = localStorage.getItem('student_id');
    if (sId) {
      axios.get(`http://localhost:8000/students/${sId}`)
        .then(res => setStudent(res.data));
    }
  }, []);

  const handleDownloadPDF = () => {
    window.open(`http://localhost:8000/download-pdf/${student.id}`, '_blank');
  };

  const handleFileUpload = async () => {
    if (!file) {
        toast.error("Please select a file first");
        return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`http://localhost:8000/upload-doc/${student.id}`, formData);
      toast.success("Document uploaded successfully!");
    } catch (err) {
      toast.error("Upload failed.");
    }
  };

  if (!student) return <div style={{ color: 'white', padding: '50px' }}>Loading Portal...</div>;

  const chartData = [
    { name: 'Your Marks', value: student.marks, fill: '#3b82f6' },
    { name: 'Passing', value: 40, fill: '#ef4444' },
    { name: 'Avg Class', value: 75, fill: '#10b981' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      style={styles.pageWrapper}
    >
      {/* Header Section */}
      <header style={styles.header}>
        <div style={styles.userGreet}>
          <UserCircle size={48} color="#3b82f6" />
          <div>
            <h1 style={styles.welcomeText}>Welcome, {student.first_name}!</h1>
            <p style={styles.subTitle}>Student Academic Dashboard</p>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div style={styles.gridContainer}>
        
        {/* Student Info Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FileText size={20} color="#3b82f6" />
            <h3 style={styles.cardTitle}>Student Profile</h3>
          </div>
          
          <div style={styles.infoContent}>
            <div style={styles.infoRow}><span>Email:</span> <strong>{student.email}</strong></div>
            <div style={styles.infoRow}><span>Grade:</span> <strong>{student.grade}</strong></div>
            <div style={styles.infoRow}><span>Student ID:</span> <strong>#{student.id}</strong></div>
          </div>

          <button onClick={handleDownloadPDF} style={styles.downloadBtn}>
            <Download size={18} /> Download Academic Report (PDF)
          </button>

          <hr style={styles.divider} />

          <div style={styles.uploadSection}>
            <h4 style={styles.sectionLabel}>Upload Documents</h4>
            <label style={styles.fileLabel}>
                <input type="file" style={styles.hiddenInput} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file ? file.name : "Choose file..."}
            </label>
            <button onClick={handleFileUpload} style={styles.uploadBtn}>
              <Upload size={18} /> Upload Now
            </button>
          </div>
        </div>

        {/* Performance Graph Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <TrendingUp size={20} color="#10b981" />
            <h3 style={styles.cardTitle}>Academic Performance</h3>
          </div>
          
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} 
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={styles.chartLegend}>Comparison against class standards</p>
        </div>

      </div>
    </motion.div>
  );
};

// Styles for a clean, spacious look
const styles: any = {
  pageWrapper: { padding: '40px 60px', color: 'white', minHeight: '100vh', background: '#020617' },
  header: { marginBottom: '40px' },
  userGreet: { display: 'flex', alignItems: 'center', gap: '20px' },
  welcomeText: { fontSize: '32px', margin: 0, fontWeight: '700' },
  subTitle: { color: '#64748b', margin: 0, fontSize: '16px' },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' },
  card: { background: '#0f172a', padding: '30px', borderRadius: '20px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' },
  cardTitle: { fontSize: '18px', margin: 0, fontWeight: '600' },
  infoContent: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '10px', color: '#94a3b8' },
  divider: { border: 'none', borderTop: '1px solid #1e293b', margin: '30px 0' },
  downloadBtn: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  uploadSection: { display: 'flex', flexDirection: 'column', gap: '15px' },
  sectionLabel: { fontSize: '14px', color: '#64748b', marginBottom: '5px' },
  fileLabel: { padding: '12px', background: '#1e293b', border: '2px dashed #334155', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '14px', color: '#94a3b8' },
  hiddenInput: { display: 'none' },
  uploadBtn: { padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' },
  chartContainer: { marginTop: '10px' },
  chartLegend: { textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '15px' }
};

export default StudentPortal;
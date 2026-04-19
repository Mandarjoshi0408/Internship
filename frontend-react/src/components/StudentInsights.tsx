import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const data = [
  { day: 'Mon', status: 1 }, { day: 'Tue', status: 1 },
  { day: 'Wed', status: 0 }, { day: 'Thu', status: 1 },
  { day: 'Fri', status: 1 }, { day: 'Sat', status: 0 },
];

const StudentInsights = () => {
  return (
    <div style={{ background: '#16161e', padding: '25px', borderRadius: '20px', border: '1px solid #2e303e', height: '100%' }}>
      <h3 style={{ marginBottom: '20px' }}>Weekly Attendance Overview</h3>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e26" vertical={false} />
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
            <YAxis hide />
            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ background: '#0d0e14', border: '1px solid #2e303e' }} />
            <Bar dataKey="status" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.status === 1 ? '#10b981' : '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '15px'}}>Green = Present | Red = Absent</p>
    </div>
  );
};

export default StudentInsights;
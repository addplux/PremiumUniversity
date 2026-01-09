import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css';

const Timetable = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const res = await axios.get('/schedules/my');
            if (res.data.success) {
                setSchedules(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch timetable:', error);
        } finally {
            setLoading(false);
        }
    };

    const getClassesForDay = (day) => {
        return schedules.filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    if (loading) return <div className="p-8">Loading your timetable...</div>;

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Weekly Timetable</h1>
            </div>

            <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(150px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                    {days.map(day => (
                        <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', fontWeight: 'bold', padding: '0.5rem', background: '#1a56db', color: 'white', borderRadius: '6px' }}>
                                {day}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '400px' }}>
                                {getClassesForDay(day).length === 0 ? (
                                    <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                                        No Classes
                                    </div>
                                ) : getClassesForDay(day).map(cls => (
                                    <div key={cls._id} style={{ padding: '0.8rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{cls.courseCode || cls.course.code}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#1e293b', marginBottom: '0.25rem' }}>{cls.course.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            🕒 {cls.startTime} - {cls.endTime}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            📍 {cls.room}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timetable;

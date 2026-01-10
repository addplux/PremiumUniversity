import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css';

const Timetable = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = [
        '08:00 - 09:00',
        '09:00 - 10:00',
        '10:00 - 11:00',
        '11:00 - 12:00',
        '12:00 - 13:00',
        '13:00 - 14:00',
        '14:00 - 15:00',
        '15:00 - 16:00',
        '16:00 - 17:00',
        '17:00 - 18:00'
    ];

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

    const getClassForSlot = (day, timeSlot) => {
        const [slotStart, slotEnd] = timeSlot.split(' - ');
        return schedules.find(s => {
            if (s.dayOfWeek !== day) return false;
            // Check if class time overlaps with this slot
            const classStart = s.startTime;
            const classEnd = s.endTime;
            return classStart <= slotStart && classEnd > slotStart;
        });
    };

    if (loading) return <div className="p-8">Loading your timetable...</div>;

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>📅 Weekly Timetable</h1>
                <p>Your class schedule for the week</p>
            </div>

            <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
                {schedules.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>No Classes Scheduled</h3>
                        <p style={{ color: '#64748b' }}>Your timetable will appear here once classes are scheduled</p>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', fontSize: '0.875rem', borderRight: '1px solid rgba(255,255,255,0.2)', width: '120px' }}>
                                        TIME
                                    </th>
                                    {days.map(day => (
                                        <th key={day} style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', fontSize: '0.875rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                                            {day.toUpperCase()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map((timeSlot, index) => (
                                    <tr key={timeSlot} style={{ borderBottom: '1px solid #e2e8f0', background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            fontSize: '0.75rem',
                                            color: '#64748b',
                                            borderRight: '1px solid #e2e8f0',
                                            background: '#f1f5f9'
                                        }}>
                                            {timeSlot}
                                        </td>
                                        {days.map(day => {
                                            const classInfo = getClassForSlot(day, timeSlot);
                                            return (
                                                <td key={day} style={{
                                                    padding: '0.5rem',
                                                    textAlign: 'center',
                                                    borderRight: '1px solid #e2e8f0',
                                                    verticalAlign: 'top'
                                                }}>
                                                    {classInfo ? (
                                                        <div style={{
                                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                            padding: '0.75rem',
                                                            borderRadius: '8px',
                                                            color: 'white',
                                                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                                                            minHeight: '80px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <div style={{ fontWeight: '700', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                                                {classInfo.course?.code || 'N/A'}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', opacity: 0.95, marginBottom: '0.25rem' }}>
                                                                {classInfo.course?.title || 'Unknown Course'}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>
                                                                📍 {classInfo.room}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>
                                                                🕒 {classInfo.startTime} - {classInfo.endTime}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{
                                                            minHeight: '80px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#cbd5e1',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            -
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Legend */}
                {schedules.length > 0 && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>📌 Quick Info</h4>
                        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.75rem', color: '#64748b' }}>
                            <div>📍 Room Location</div>
                            <div>🕒 Class Time</div>
                            <div>Total Classes: {schedules.length}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Timetable;

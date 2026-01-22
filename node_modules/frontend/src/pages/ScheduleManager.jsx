import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css';

const ScheduleManager = () => {
    const [schedules, setSchedules] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        course: '',
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '11:00',
        room: ''
    });

    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        type: 'Social'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [schedRes, courseRes] = await Promise.all([
                axios.get('/schedules'),
                axios.get('/courses')
            ]);
            if (schedRes.data.success) setSchedules(schedRes.data.data);
            if (courseRes.data.success) setCourses(courseRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/schedules', formData);
            if (res.data.success) {
                alert('Schedule created');
                fetchData();
                setShowForm(false);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create schedule');
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/events', eventForm);
            if (res.data.success) {
                alert('Event created');
                setEventForm({ title: '', description: '', date: '', location: '', type: 'Social' });
            }
        } catch (error) {
            alert('Failed to create event');
        }
    };

    const handleDeleteSchedule = async (id) => {
        if (!window.confirm('Delete this schedule?')) return;
        try {
            await axios.delete(`/schedules/${id}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Schedule & Event Manager</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    {showForm ? 'View All' : '+ Assign Class'}
                </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div>
                    {showForm ? (
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
                            <h2>Assign Class to Room</h2>
                            <form onSubmit={handleCreateSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                                <select className="status-select-large" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} required>
                                    <option value="">-- Select Course --</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.code}: {c.title}</option>)}
                                </select>
                                <select className="status-select-large" value={formData.dayOfWeek} onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })} required>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input type="time" className="status-select-large" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                                    <input type="time" className="status-select-large" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required />
                                </div>
                                <input placeholder="Room Name (e.g. Hall A)" className="status-select-large" value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} required />
                                <button type="submit" className="btn-primary" style={{ padding: '0.8rem' }}>Save Schedule</button>
                            </form>
                        </div>
                    ) : (
                        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Course</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Day</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Time</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Room</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.map(s => (
                                        <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem' }}>{s.course.code}</td>
                                            <td style={{ padding: '1rem' }}>{s.dayOfWeek}</td>
                                            <td style={{ padding: '1rem' }}>{s.startTime} - {s.endTime}</td>
                                            <td style={{ padding: '1rem' }}>{s.room}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <button onClick={() => handleDeleteSchedule(s._id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', height: 'fit-content' }}>
                    <h3>Create Campus Event</h3>
                    <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <input placeholder="Event Title" className="status-select-large" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} required />
                        <textarea placeholder="Description" className="status-select-large" rows="3" value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} required />
                        <input type="date" className="status-select-large" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} required />
                        <input placeholder="Location" className="status-select-large" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} required />
                        <select className="status-select-large" value={eventForm.type} onChange={e => setEventForm({ ...eventForm, type: e.target.value })}>
                            <option value="Academic">Academic</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Social">Social</option>
                            <option value="Holiday">Holiday</option>
                        </select>
                        <button type="submit" style={{ background: '#10b981', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Post Event</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ScheduleManager;

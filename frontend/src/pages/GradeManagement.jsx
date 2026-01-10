import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const GradeManagement = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [formData, setFormData] = useState({
        studentId: '',
        courseId: '',
        caMarks: '',
        examMarks: '',
        semester: '',
        academicYear: new Date().getFullYear().toString(),
        remarks: ''
    });

    useEffect(() => {
        fetchCourses();
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchGrades(selectedCourse);
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('/courses');
            if (res.data.success) {
                setCourses(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/users?role=student');
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
    };

    const fetchGrades = async (courseId) => {
        try {
            const res = await axios.get(`/grades/course/${courseId}`);
            if (res.data.success) {
                setGrades(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch grades:', error);
        }
    };

    const handlePostGrade = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/grades', formData);
            if (res.data.success) {
                alert('Grade posted successfully!');
                setShowPostModal(false);
                setFormData({
                    studentId: '',
                    courseId: '',
                    caMarks: '',
                    examMarks: '',
                    semester: '',
                    academicYear: new Date().getFullYear().toString(),
                    remarks: ''
                });
                if (selectedCourse) {
                    fetchGrades(selectedCourse);
                }
            }
        } catch (error) {
            console.error('Failed to post grade:', error);
            alert(error.response?.data?.message || 'Failed to post grade');
        }
    };

    if (loading) return <div className="p-8">Loading grade management...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>🎓 Grade Management</h1>
                <p>Post and manage student CA marks and GPA</p>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                >
                    <option value="">Select a course...</option>
                    {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                            {course.code} - {course.title}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => setShowPostModal(true)}
                    className="btn-primary"
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    ➕ Post Grade
                </button>
            </div>

            {/* Grades Table */}
            {selectedCourse && (
                <div className="dashboard-section">
                    <h2>Grades for {courses.find(c => c._id === selectedCourse)?.title}</h2>
                    <div className="applications-table">
                        <div className="table-row" style={{ fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                            <div className="table-cell">Student</div>
                            <div className="table-cell">CA Marks</div>
                            <div className="table-cell">Exam Marks</div>
                            <div className="table-cell">Total</div>
                            <div className="table-cell">Grade</div>
                            <div className="table-cell">GPA</div>
                            <div className="table-cell">Semester</div>
                        </div>
                        {grades.map((grade) => (
                            <div key={grade._id} className="table-row">
                                <div className="table-cell">
                                    <strong>{grade.student?.firstName} {grade.student?.lastName}</strong>
                                    <p className="text-small">{grade.student?.email}</p>
                                </div>
                                <div className="table-cell">{grade.caMarks}</div>
                                <div className="table-cell">{grade.examMarks}</div>
                                <div className="table-cell"><strong>{grade.totalMarks}</strong></div>
                                <div className="table-cell">
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        backgroundColor: grade.grade === 'F' ? '#fee2e2' : '#dcfce7',
                                        color: grade.grade === 'F' ? '#991b1b' : '#166534',
                                        fontWeight: 'bold'
                                    }}>
                                        {grade.grade}
                                    </span>
                                </div>
                                <div className="table-cell"><strong>{grade.gpa.toFixed(1)}</strong></div>
                                <div className="table-cell text-small">{grade.semester} {grade.academicYear}</div>
                            </div>
                        ))}
                        {grades.length === 0 && <p>No grades posted for this course yet.</p>}
                    </div>
                </div>
            )}

            {/* Post Grade Modal */}
            {showPostModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h2>Post Grade</h2>
                        <form onSubmit={handlePostGrade}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Student</label>
                                <select
                                    required
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                >
                                    <option value="">Select student...</option>
                                    {students.map((student) => (
                                        <option key={student._id} value={student._id}>
                                            {student.firstName} {student.lastName} - {student.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Course</label>
                                <select
                                    required
                                    value={formData.courseId}
                                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                >
                                    <option value="">Select course...</option>
                                    {courses.map((course) => (
                                        <option key={course._id} value={course._id}>
                                            {course.code} - {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>CA Marks</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="100"
                                        value={formData.caMarks}
                                        onChange={(e) => setFormData({ ...formData, caMarks: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Exam Marks</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="100"
                                        value={formData.examMarks}
                                        onChange={(e) => setFormData({ ...formData, examMarks: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Semester</label>
                                    <select
                                        required
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Semester 1">Semester 1</option>
                                        <option value="Semester 2">Semester 2</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Academic Year</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.academicYear}
                                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Remarks (Optional)</label>
                                <textarea
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    rows="3"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    Post Grade
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPostModal(false)}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', backgroundColor: '#6b7280', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradeManagement;

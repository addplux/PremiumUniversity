import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './ProgramsPage.css';

const ProgramsPage = () => {
    const programs = [
        {
            id: 'nursing',
            name: 'Registered Nursing',
            level: 'Diploma Program',
            duration: '3 Years',
            description: 'Comprehensive nursing education preparing you for professional practice with hands-on clinical training.',
            requirements: [
                'Full grade 12 certificate',
                '5 credits or better in English, Mathematics, Biology or Science',
                'Plus any other 2 subjects',
                'As per General Nursing Council of Zambia'
            ],
            careerProspects: [
                'Registered Nurse in Hospitals',
                'Community Health Nurse',
                'Specialist Nurse (with further training)',
                'Nursing Educator',
                'Nurse Manager'
            ]
        },
        {
            id: 'clinical',
            name: 'Clinical Medicine',
            level: 'Diploma Program',
            duration: '3 Years',
            description: 'Advanced medical training for clinical officers providing diagnostic and treatment skills.',
            requirements: [
                'Full grade 12 certificate',
                '5 credits or better in English, Mathematics, Biology, Science',
                'Plus any other subject',
                'As per Health Professionals Council of Zambia'
            ],
            careerProspects: [
                'Clinical Officer in Hospitals',
                'Rural Health Center Officer',
                'Emergency Medical Officer',
                'Theatre Clinical Officer',
                'Health Program Coordinator'
            ]
        },
        {
            id: 'environmental',
            name: 'Environmental Health Technologist',
            level: 'Diploma Program',
            duration: '3 Years',
            description: 'Expert training in public health, sanitation, and environmental safety management.',
            requirements: [
                'Full grade 12 results certificate'
            ],
            careerProspects: [
                'Environmental Health Officer',
                'Public Health Inspector',
                'Sanitation Officer',
                'Occupational Health & Safety Officer',
                'Food Safety Inspector'
            ]
        },
        {
            id: 'abridged',
            name: 'EN to RN Abridged Program',
            level: 'Bridging Program',
            duration: '2 Years',
            description: 'Fast-track program for Enrolled Nurses to advance to Registered Nurse qualification.',
            requirements: [
                'Must be a qualified Enrolled Nurse',
                'Valid practicing license',
                'Minimum 2 years work experience recommended'
            ],
            careerProspects: [
                'Registered Nurse',
                'Ward Manager',
                'Nursing Supervisor',
                'Clinical Instructor',
                'Healthcare Administrator'
            ]
        }
    ];

    return (
        <div className="programs-page">
            <Navbar />

            <section className="page-hero">
                <div className="container">
                    <h1>Our Programs</h1>
                    <p>Choose your path to professional excellence in healthcare</p>
                </div>
            </section>

            <section className="programs-content">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">January 2026 Intake Open</span>
                        <p className="section-subtitle">
                            We are currently enrolling students for all our accredited programs.
                            Start your journey to becoming a healthcare professional.
                        </p>
                    </div>

                    <div className="programs-list">
                        {programs.map((program) => (
                            <div key={program.id} id={program.id} className="program-detail-card">
                                <div className="program-header">
                                    <div>
                                        <h2>{program.name}</h2>
                                        <div className="program-meta">
                                            <span className="badge">{program.level}</span>
                                            <span className="duration">📅 {program.duration}</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="program-desc">{program.description}</p>

                                <div className="program-details-grid">
                                    <div className="detail-section">
                                        <h4>Entry Requirements</h4>
                                        <ul>
                                            {program.requirements.map((req, index) => (
                                                <li key={index}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Career Prospects</h4>
                                        <ul>
                                            {program.careerProspects.map((career, index) => (
                                                <li key={index}>{career}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="program-actions">
                                    <a href="/admissions" className="btn-primary">Apply for this Program</a>
                                    <a href="/contact" className="btn-secondary">Request More Info</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ProgramsPage;

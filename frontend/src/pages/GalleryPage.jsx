import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './GalleryPage.css';

const GalleryPage = () => {
    const gallery = [
        {
            src: '/assets/facility_equipment.jpg',
            title: 'Medical Equipment & Training',
            category: 'Facilities'
        },
        {
            src: '/assets/students_group.jpg',
            title: 'Our Students',
            category: 'Student Life'
        },
        {
            src: '/assets/clinical_training.jpg',
            title: 'Clinical Practice',
            category: 'Training'
        },
        {
            src: '/assets/graduation.jpg',
            title: 'Graduation Ceremony',
            category: 'Events'
        },
        {
            src: '/assets/celebration.jpg',
            title: 'Celebrating Success',
            category: 'Events'
        }
    ];

    return (
        <div className="gallery-page">
            <Navbar />

            <section className="page-hero">
                <div className="container">
                    <h1>Student Life & Facilities</h1>
                    <p>Experience life at PSOHS through our gallery</p>
                </div>
            </section>

            <section className="programs-content">
                <div className="container">
                    <div className="gallery-grid">
                        {gallery.map((item, index) => (
                            <div key={index} className="gallery-item">
                                <img src={item.src} alt={item.title} />
                                <div className="gallery-overlay">
                                    <span className="gallery-category">{item.category}</span>
                                    <h3>{item.title}</h3>
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

export default GalleryPage;

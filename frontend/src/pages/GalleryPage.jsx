import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './GalleryPage.css';

const GalleryPage = () => {
    const gallery = [
        {
            src: 'C:/Users/flyst/.gemini/antigravity/brain/70241dd5-b90c-44e6-af60-d66cfb9fe4bc/uploaded_image_0_1767895364487.jpg',
            title: 'Medical Equipment & Training',
            category: 'Facilities'
        },
        {
            src: 'C:/Users/flyst/.gemini/antigravity/brain/70241dd5-b90c-44e6-af60-d66cfb9fe4bc/uploaded_image_1_1767895364487.jpg',
            title: 'Our Students',
            category: 'Student Life'
        },
        {
            src: 'C:/Users/flyst/.gemini/antigravity/brain/70241dd5-b90c-44e6-af60-d66cfb9fe4bc/uploaded_image_2_1767895364487.jpg',
            title: 'Clinical Practice',
            category: 'Training'
        },
        {
            src: 'C:/Users/flyst/.gemini/antigravity/brain/70241dd5-b90c-44e6-af60-d66cfb9fe4bc/uploaded_image_3_1767895364487.jpg',
            title: 'Graduation Ceremony',
            category: 'Events'
        },
        {
            src: 'C:/Users/flyst/.gemini/antigravity/brain/70241dd5-b90c-44e6-af60-d66cfb9fe4bc/uploaded_image_4_1767895364487.jpg',
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

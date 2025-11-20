import React, { useState } from 'react';
import './Gallery.css';

const categories = [
    'All',
    'Gold Collection',
    'Silver Collection',
    'Diamond Collection',
    'Events & Exhibitions'
];

const images = [
    { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', category: 'Gold Collection', caption: '22K Gold Necklace Set' },
    { url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', category: 'Diamond Collection', caption: 'Solitaire Diamond Ring' },
    { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', category: 'Silver Collection', caption: 'Handcrafted Silver Jewelry' },
    { url: 'https://images.unsplash.com/photo-1671642883395-0ab89c3ac890?q=80&w=1633&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', category: 'Events & Exhibitions', caption: 'Annual Jewelry Exhibition' },
    { url: 'https://images.unsplash.com/photo-1611107683227-e9060eccd846?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', category: 'Gold Collection', caption: 'Antique Gold Bangles' },
    { url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', category: 'Silver Collection', caption: 'Silver Pendant Set' },
    { url: 'https://images.unsplash.com/photo-1543295204-2ae345412549?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', category: 'Bridal Collection', caption: 'Wedding Jewelry Collection' },
    { url: 'https://i.etsystatic.com/11584262/r/il/5656e9/2789708118/il_794xN.2789708118_fqom.jpg', category: 'Events & Exhibitions', caption: 'Craftsmanship Demonstration' }
];

const Gallery = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [modalImage, setModalImage] = useState(null);
    const [loadedImages, setLoadedImages] = useState([]);

    const handleImageLoad = (index) => {
        setLoadedImages(prev => [...prev, index]);
    };

    const filteredImages = selectedCategory === 'All'
        ? images
        : images.filter(img => img.category === selectedCategory);

    return (
        <div className="gallery-container">
            {/* Hero Section */}
            <section className="gallery-hero">
                <div className="hero-overlay">
                    <h1>BMG Jewellery Gallery</h1>
                    <p className="subtitle">Where Tradition Meets Exquisite Craftsmanship</p>
                    <div className="divider"></div>
                </div>
            </section>

            {/* Category Filter */}
            <div className="category-filter">
                <div className="filter-container">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="gallery-grid">
                {filteredImages.map((img, index) => (
                    <div
                        key={index}
                        className={`gallery-item ${loadedImages.includes(index) ? 'loaded' : ''}`}
                        onClick={() => setModalImage(img)}
                    >
                        <div className="image-container">
                            <img
                                src={img.url}
                                alt={img.caption}
                                loading="lazy"
                                onLoad={() => handleImageLoad(index)}
                            />
                            <div className="image-overlay">
                                <div className="overlay-content">
                                    <span className="material-icons">zoom_in</span>
                                    <p>{img.caption}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {modalImage && (
                <div className="lightbox" onClick={() => setModalImage(null)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setModalImage(null)}>
                            &times;
                        </button>
                        <div className="lightbox-image-container">
                            <img src={modalImage.url} alt={modalImage.caption} />
                        </div>
                        <div className="lightbox-caption">
                            <h3>{modalImage.category}</h3>
                            <p>{modalImage.caption}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* CTA Section */}
            <section className="gallery-cta">
                <h2>Ready to Find Your Perfect Piece?</h2>
                <p>Visit our showroom or browse our collections online</p>
                <div className="cta-buttons">
                    <button className="primary-btn" onClick={() => window.location.href = '/products'}>
                        View Collections
                    </button>
                    <button className="secondary-btn" onClick={() => window.location.href = '/contact'}>
                        Book Appointment
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Gallery;
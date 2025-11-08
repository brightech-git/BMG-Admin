import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../service/authService';
import { useAuth } from '../../context/auth/authContext';
import { MyContext } from '../../context/themeContext/themeContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import './LoginPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import your images
import image1 from '../../assets/images/login/Login1.jpg';
import image2 from '../../assets/images/login/Login2.jpg';
import image3 from '../../assets/images/login/Login3.png';
import Logo from '../../assets/logo/logo.jpg';

const LoginPage = () => {
    const [form, setForm] = useState({ contactOrEmailOrUsername: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [focusedField, setFocusedField] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();
    const { themeMode } = useContext(MyContext);
    const passwordInputRef = useRef(null);
    const swiperRef = useRef(null);

    const slides = [
        {
            image: image1,
            title: "Advanced Analytics Dashboard",
            description: "Real-time insights and comprehensive data visualization tools",
            icon: "📊"
        },
        {
            image: image2,
            title: "Secure System Management",
            description: "Enterprise-grade security with full administrative control",
            icon: "🔒"
        },
        {
            image: image3,
            title: "Streamlined Operations",
            description: "Efficient workflow management and automation tools",
            icon: "⚡"
        }
    ];

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.name === 'contactOrEmailOrUsername') {
            passwordInputRef.current?.focus();
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await loginUser(form);
            const token = result.token;
            const userData = {
                id: result.user.id,
                email: result.user.email,
                username: result.user.username,
                roles: result.user.roles, 
            };
            const roles = userData.roles || [];
            if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_EMPLOYEE' || roles.includes('ROLE_USER'))) {
                login(token, userData);
                navigate('/admin');
            } else {
                setError('Access Denied: Please use the main site for shopping. Contact support for admin access.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 6000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className={`enhanced-login-container ${themeMode}`}>
            <div className="login-grid">
                {/* Left Side - Enhanced Carousel */}
                {!isMobile && (
                    <div className="carousel-section">
                        <div className="brand-header">
                            <div className="logo-container">
                                <img src={Logo} alt="Company Logo" className="brand-logo" />
                                <div className="brand-text">
                                    <h1>Admin Portal</h1>
                                    <p>Enterprise Management System</p>
                                </div>
                            </div>
                        </div>

                        <div className="carousel-wrapper">
                            <Swiper
                                ref={swiperRef}
                                modules={[Pagination, Navigation, Autoplay, EffectFade]}
                                effect="fade"
                                fadeEffect={{ crossFade: true }}
                                spaceBetween={0}
                                slidesPerView={1}
                                autoplay={{
                                    delay: 4000,
                                    disableOnInteraction: false
                                }}
                                pagination={{
                                    clickable: true,
                                    dynamicBullets: true,
                                    renderBullet: (index, className) => {
                                        return `<span class="${className} custom-bullet">${slides[index].icon}</span>`;
                                    }
                                }}
                                onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
                                className="enhanced-swiper"
                            >
                                {slides.map((slide, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="slide-content">
                                            <div className="slide-image-container">
                                                <img src={slide.image} alt={`Slide ${index + 1}`} className="slide-image" />
                                                <div className="image-overlay"></div>
                                            </div>
                                            <div className="slide-text">
                                                <div className="slide-icon">{slide.icon}</div>
                                                <h3 className="slide-title">{slide.title}</h3>
                                                <p className="slide-description">{slide.description}</p>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        <div className="features-grid">
                            <div className="feature-item">
                                <div className="feature-icon">🛡️</div>
                                <span>Enterprise Security</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">📈</div>
                                <span>Real-time Analytics</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">⚙️</div>
                                <span>System Control</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Side - Enhanced Login Form */}
                <div className="form-section">
                    <div className="form-container">
                        {isMobile && (
                            <div className="mobile-header">
                                <img src={Logo} alt="Logo" className="mobile-logo" />
                                <h1>Admin Portal</h1>
                                
                            </div>
                        )}

                        <div className="form-header">
                            <div className="header-icon">
                                <div className="icon-wrapper">
                                    🔐
                                </div>
                            </div>
                            <h2>Welcome Back</h2>
                            <p>Sign in to access your administrative dashboard</p>
                        </div>

                        {error && (
                            <div className="error-alert">
                                <div className="error-icon">⚠️</div>
                                <div className="error-content">
                                    <strong>Authentication Failed</strong>
                                    <p>{error}</p>
                                </div>
                                <button
                                    className="error-dismiss"
                                    onClick={() => setError('')}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <form className="enhanced-form" onSubmit={handleLogin}>
                            <div className="form-group-enhanced">
                                <label className={`form-label ${focusedField === 'username' ? 'focused' : ''}`}>
                                    <span className="label-icon">👤</span>
                                    {isMobile ? 'Admin ID' : 'Username / Email'}
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        className={`form-input ${focusedField === 'username' ? 'focused' : ''}`}
                                        name="contactOrEmailOrUsername"
                                        placeholder={isMobile ? 'Enter your admin ID' : 'Enter username or email address'}
                                        value={form.contactOrEmailOrUsername}
                                        onChange={(e) => setForm({ ...form, contactOrEmailOrUsername: e.target.value })}
                                        onFocus={() => setFocusedField('username')}
                                        onBlur={() => setFocusedField('')}
                                        onKeyDown={handleKeyDown}
                                        required
                                        autoFocus
                                    />
                                    <div className="input-border"></div>
                                </div>
                            </div>

                            <div className="form-group-enhanced">
                                <label className={`form-label ${focusedField === 'password' ? 'focused' : ''}`}>
                                    <span className="label-icon">🔑</span>
                                    Password
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        ref={passwordInputRef}
                                        type={showPassword ? 'text' : 'password'}
                                        className={`form-input ${focusedField === 'password' ? 'focused' : ''}`}
                                        name="password"
                                        placeholder="Enter your secure password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField('')}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex="-1"
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                    <div className="input-border"></div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className={`submit-button ${isLoading ? 'loading' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="loading-spinner"></div>
                                            <span>Authenticating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <div className="button-arrow">→</div>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="form-footer">
                            {/* <div className="security-badge">
                                <span className="badge-icon">🛡️</span>
                                <div className="badge-text">
                                    <strong>Secure Login</strong>
                                    <p>256-bit SSL encryption</p>
                                </div>
                            </div> */}
                            <div className="support-link">
                                <p>Need assistance? <strong>Contact System Administrator</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .enhanced-login-container {
                    min-height :100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .login-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    max-width: 1200px;
                    width: 100%;
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    height: 100%;
                }

                /* Carousel Section */
                .carousel-section {
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    color: white;
                    position: relative;
                    overflow: hidden;
                }

                .carousel-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.04)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                    pointer-events: none;
                }

                .brand-header {
                    margin-bottom: 10px;
                    z-index: 2;
                    position: relative;
                }

                .logo-container {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .brand-logo {
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    object-fit: cover;
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
                }

                .brand-text h1 {
                    margin:5px;
                    font-size: 24px;
                    font-weight: 700;
                    background: linear-gradient(45deg, #ffffff, #e0e7ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .brand-text p {
                    margin: 2px 0 0 0;
                    font-size: 13px;
                    opacity: 0.8;
                }

                .carousel-wrapper {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    margin:10px 0;
                }

                .enhanced-swiper {
                    width: 100%;
                    height: 350px;
                }

                .slide-content {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                .slide-image-container {
                    width: 240px;
                    height: 200px;
                    border-radius: 14px;
                    overflow: hidden;
                    position: relative;
                    margin-bottom: 18px;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                }

                .slide-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .image-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(45deg, rgba(30, 60, 114, 0.3), rgba(42, 82, 152, 0.3));
                }

                .slide-text {
                    text-align: center;
                }

                .slide-icon {
                    font-size: 28px;
                    margin-bottom: 6px;
                }

                .slide-title {
                    font-size: 20px;
                    font-weight: 600;
                    margin: 0 0 6px 0;
                    line-height: 1.3;
                }

                .slide-description {
                    font-size: 14px;
                    opacity: 0.9;
                    line-height: 1.4;
                    margin: 0;
                    max-width: 260px;
                }

                .enhanced-swiper .swiper-pagination {
                    bottom: -35px;
                }

                .enhanced-swiper .custom-bullet {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 3px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .enhanced-swiper .custom-bullet.swiper-pagination-bullet-active {
                    background: rgba(255, 255, 255, 0.9);
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    z-index: 2;
                    position: relative;
                }

                .feature-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    backdrop-filter: blur(10px);
                }

                .feature-icon {
                    font-size: 20px;
                    margin-bottom: 6px;
                }

                .feature-item span {
                    font-size: 11px;
                    font-weight: 500;
                    opacity: 0.9;
                }

                /* Form Section */
                .form-section {
                    display: flex;
                    align-items: center;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                }

                .form-container {
                    width: 100%;
                    max-width: 400px;
                    margin: 0 auto;
                }

                .mobile-header {
                    display: flex;
                    justify-content:space-between
                    text-align: center;
                    margin-bottom: 0px;
                }

                .mobile-logo {
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    margin-bottom: 12px;
                }

                .mobile-header h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 10px 0;
                    text-align:center;
                    justify-content:center;
                }

                .mobile-header p {
                    color: #64748b;
                    margin: 0;
                    font-size: 14px;
                }

                .form-header {
                    text-align: center;
                    margin-bottom: 10px;
                   
                }

                .header-icon {
                    margin-bottom: 18px;
                }

                .icon-wrapper {
                    width: 65px;
                    height: 65px;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 30px;
                    margin: 0 auto;
                    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
                }

                .form-header h2 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 6px 0;
                }

                .form-header p {
                    color: #64748b;
                    font-size: 13px;
                    margin: 0;
                }

                /* Error Alert */
                .error-alert {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    background: linear-gradient(135deg, #fef2f2, #fee2e2);
                    border: 1px solid #fca5a5;
                    border-radius: 10px;
                    padding: 14px;
                    margin-bottom: 20px;
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .error-icon {
                    font-size: 20px;
                    margin-top: 2px;
                }

                .error-content {
                    flex: 1;
                }

                .error-content strong {
                    display: block;
                    color: #dc2626;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .error-content p {
                    color: #b91c1c;
                    font-size: 14px;
                    margin: 0;
                    line-height: 1.4;
                }

                .error-dismiss {
                    background: none;
                    border: none;
                    color: #dc2626;
                    cursor: pointer;
                    font-size: 18px;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.2s;
                }

                .error-dismiss:hover {
                    background-color: rgba(220, 38, 38, 0.1);
                }

                /* Enhanced Form */
                .enhanced-form {
                    margin-bottom: 10px;
                }

                .form-group-enhanced {
                    margin-bottom: 6px;
                }

                .form-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 5px;
                    transition: color 0.2s;
                }

                .form-label.focused {
                    color: #3b82f6;
                }

                .label-icon {
                    font-size: 16px;
                }

                .input-wrapper {
                    position: relative;
                }

                .form-input {
                    width: 100%;
                    height: 50px;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 14px 18px;
                    font-size: 15px;
                    background: white;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                }


                .input-border {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                    border-radius: 0 0 12px 12px;
                    transform: scaleX(0);
                    transition: transform 0.3s ease;
                }

                .form-input:focus + .input-border {
                    transform: scaleX(1);
                }

                .password-toggle {
                    position: absolute;
                    right: 14px;
                    top: 40%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0px;
                    border-radius: 6px;
                    transition: background-color 0.2s;
                }

                .password-toggle:hover {
                    background-color: #f3f4f6;
                }

                /* Submit Button */
                .form-actions {
                    margin-top: 15px;
                }

                .submit-button {
                    width: 100%;
                    height: 50px;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 6px 14px rgba(59, 130, 246, 0.3);
                }

                .submit-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 18px rgba(59, 130, 246, 0.4);
                }

                .submit-button:active {
                    transform: translateY(0);
                }

                .submit-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .loading-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .button-arrow {
                    font-size: 20px;
                    font-weight: bold;
                    transition: transform 0.3s ease;
                }

                .submit-button:hover .button-arrow {
                    transform: translateX(4px);
                }

                /* Form Footer */
                .form-footer {
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }

                .security-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
                    border: 1px solid #bbf7d0;
                    border-radius: 10px;
                    padding: 12px;
                    margin-bottom: 16px;
                }

                .badge-icon {
                    font-size: 20px;
                }

                .badge-text strong {
                    display: block;
                    color: #166534;
                    font-size: 13px;
                    font-weight: 600;
                }

                .badge-text p {
                    color: #16a34a;
                    font-size: 11px;
                    margin: 1px 0 0 0;
                }

                .support-link p {
                    color: #64748b;
                    font-size: 14px;
                    margin: 0;
                }

                .support-link strong {
                    color: #3b82f6;
                    cursor: pointer;
                    text-decoration: none;
                }

                .support-link strong:hover {
                    text-decoration: underline;
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .enhanced-login-container {
                        padding: 16px;
                    }

                    .login-grid {
                        grid-template-columns: 1fr;
                        border-radius: 16px;
                        min-height: auto;
                    }

                    .carousel-section {
                        display: none;
                    }

                   

                    .form-header h2 {
                        font-size: 22px;
                    }

                    .icon-wrapper {
                        width: 60px;
                        height: 60px;
                        font-size: 28px;
                    }
                }

                @media (max-width: 480px) {
                   
                    .form-group-enhanced {
                        margin-bottom: 24px;
                    }

                    .form-input {
                        height: 48px;
                        padding: 12px 16px;
                        font-size: 16px;
                    }

                    .submit-button {
                        height: 48px;
                        font-size: 15px;
                    }

                    .security-badge {
                        flex-direction: column;
                        text-align: center;
                    }

                    .error-alert {
                        padding: 12px;
                    }
                }

                @media (max-height: 600px) and (max-width: 768px) {
                  

                    .form-header {
                        margin-bottom: 24px;
                    }

                    .icon-wrapper {
                        width: 50px;
                        height: 50px;
                        font-size: 24px;
                    }

                    .form-header h2 {
                        font-size: 24px;
                    }
                        .form-header p {
                            font-size: 12px;
                        }

                    .form-group-enhanced {
                        margin-bottom: 20px;
                    }

                    .form-actions {
                        margin-top: 24px;
                    }

                  
                }

                /* Dark mode support */
                .enhanced-login-container.dark {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                }

                .dark .login-grid {
                    background: #1e293b;
                    color: #f1f5f9;
                }

                .dark .form-section {
                    background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
                }

                .dark .form-header h2 {
                    color: #f1f5f9;
                }

                .dark .form-header p {
                    color: #94a3b8;
                }

                .dark .form-label {
                    color: #e2e8f0;
                }

                .dark .form-input {
                    background: #374151;
                    border-color: #4b5563;
                    color: #f1f5f9;
                }

                .dark .form-input:focus {
                    border-color: #60a5fa;
                }

                .dark .password-toggle:hover {
                    background-color: #4b5563;
                }

                .dark .support-link p {
                    color: #94a3b8;
                }

                .dark .form-footer {
                    border-color: #4b5563;
                }

                /* Animation enhancements */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .form-container {
                    animation: fadeInUp 0.6s ease-out;
                }

                .carousel-section {
                    animation: fadeInUp 0.8s ease-out;
                }

                /* Focus visible improvements */
                .form-input:focus-visible {
                    outline: 2px solid #3b82f6;
                    outline-offset: 2px;
                }

                .submit-button:focus-visible {
                    outline: 2px solid #93c5fd;
                    outline-offset: 2px;
                }

                /* High contrast mode support */
                @media (prefers-contrast: high) {
                    .form-input {
                        border-width: 3px;
                    }
                    
                    .submit-button {
                        border: 2px solid #1d4ed8;
                    }
                }

                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    .enhanced-swiper {
                        /* Disable autoplay if user prefers reduced motion */
                    }
                    
                    .form-input,
                    .submit-button,
                    .input-border {
                        transition: none;
                    }
                    
                    .form-container,
                    .carousel-section {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
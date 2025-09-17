import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../service/authService';
import { useAuth } from '../../context/auth/authContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './LoginPage.css';

// Import your images
import image1 from '../../assets/images/login/Login1.jpg';
import image2 from '../../assets/images/login/Login2.jpg';
import image3 from '../../assets/images/login/Login3.png';

import Logo from '../../assets/logo/logo.jpg';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage = () => {
    const [form, setForm] = useState({ contactOrEmailOrUsername: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const navigate = useNavigate();
    const { login } = useAuth();
    const passwordInputRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
            if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_USER')) {
                login(token, userData);
                navigate('/admin');
            } else if (roles.includes('ROLE_USER') || roles.includes('USER')) {
                setError('Access Denied: Please use the main site for shopping. Contact support for admin access.');
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
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <section className="sign-in-page">
            <div className={`container sign-in-page-bg ${isMobile ? 'mobile-view' : ''} mt-4 mb-md-4 mb-0 p-0`}>
                <div className="row no-gutters">
                    
                    {/* Left Side - Carousel (hidden on mobile) */}
                    {!isMobile && (
                        <div className="col-md-6 text-center sign-in-details">
                            <div className="sign-in-detail text-white"> 
                                
                                <p className="sign-in-logo mb-8">
                                    <img src={Logo} className="img-fluid" alt="logo" />
                                    <span className="logName">Admin Portal</span>
                                </p>

                                <Swiper
                                    modules={[Pagination, Navigation, Autoplay]}
                                    spaceBetween={10}
                                    slidesPerView={1}
                                    autoplay={{ delay: 3000 }}
                                    pagination={{ clickable: true, type: 'bullets' }}
                                    className="swiper-navigation"
                                >
                                    <SwiperSlide>
                                        <img src={image1} alt="Slide 1" className="img-fluid" />
                                        <h4 className="firstSlide">Admin Dashboard</h4>
                                        <p className="firstSlidePara">
                                            Comprehensive tools for managing your organization
                                        </p>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <img src={image2} alt="Slide 2" className="img-fluid" />
                                        <h4 className="firstSlide">System Control</h4>
                                        <p className="firstSlidePara">
                                            Full administrative access to all system features
                                        </p>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <img src={image3} alt="Slide 3" className="img-fluid" />
                                        <h4 className="firstSlide">User Management</h4>
                                        <p className="firstSlidePara">
                                            Manage permissions and access levels with ease
                                        </p>
                                    </SwiperSlide>
                                </Swiper>
                            </div>
                        </div>
                    )}

                    {/* Right Side - Login Form */}
                    <div className={`${isMobile ? 'col-12' : 'col-md-6'} position-relative`}>
                        <div className={`sign-in-from ${isMobile ? 'mobile-sign-in' : ''}`}>
                            {!isMobile && (
                                <>
                                    <h1 className="mb-0">Admin Login</h1>
                                    <p>Secure access to administrative panel</p>
                                </>
                            )}

                            {error && (
                                <div className="error-message">
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form className="mt-4" onSubmit={handleLogin}>
                                <div className="form-group">
                                    <label className="mb-0">
                                        {isMobile ? 'Admin ID' : 'Admin Name / Email'}
                                    </label>
                                    <input
                                        type="text" // Always use text to allow full input
                                        className="form-control mb-1"
                                        name="contactOrEmailOrUsername"
                                        placeholder={isMobile ? 'Enter admin ID' : 'Enter admin name or email'}
                                        value={form.contactOrEmailOrUsername}
                                        onChange={(e) =>
                                            setForm({ ...form, contactOrEmailOrUsername: e.target.value })
                                        }
                                        onKeyDown={handleKeyDown}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="d-flex justify-content-between my-2">
                                    <label>Password</label>
                                </div>
                                <input
                                    ref={passwordInputRef}
                                    type="password"
                                    className="form-control mb-0"
                                    placeholder="Enter admin password"
                                    name="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <div className="d-flex w-100 justify-content-center align-items-center mt-3">
                                    <button
                                        type="submit"
                                        className="btn btn-primary float-end"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="button-loader"></span>
                                        ) : (
                                            <>
                                                <span className="button-text">Log In</span>
                                                <span className="button-icon">
                                                    <svg viewBox="0 0 25 22" fill="currentColor" width="25" height="22">
                                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="sign-info">
                                    <span className="dark-color d-inline-block line-height-2">
                                        Need access? <span className='contact-admin'> Contact Super Admin</span>
                                    </span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginPage;
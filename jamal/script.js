document.addEventListener('DOMContentLoaded', function() {
    // Dashboard Toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const profilePicture = document.getElementById('profilePicture');
    const cameraBtn = document.getElementById('cameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    const closeModal = document.querySelector('.close');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    let stream = null;

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        
        if (isDarkMode) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('darkMode', 'enabled');
        } else {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    // Scroll Progress Bar
    const scrollProgress = document.querySelector('.scroll-progress');
    
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        scrollProgress.style.width = scrollPercentage + '%';
    });

    // Scroll to Top Button
    const scrollToTop = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTop.classList.add('visible');
        } else {
            scrollToTop.classList.remove('visible');
        }
    });
    
    scrollToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Floating Action Button
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '<i class="fas fa-plus"></i>';
    fab.title = 'Quick Actions';
    document.body.appendChild(fab);
    
    fab.addEventListener('click', () => {
        // Create quick actions menu
        const existingMenu = document.querySelector('.quick-actions-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        const menu = document.createElement('div');
        menu.className = 'quick-actions-menu';
        menu.innerHTML = `
            <button onclick="alert('New feature coming soon!')">
                <i class="fas fa-file"></i> New Document
            </button>
            <button onclick="alert('Settings coming soon!')">
                <i class="fas fa-cog"></i> Settings
            </button>
            <button onclick="alert('Share feature coming soon!')">
                <i class="fas fa-share"></i> Share
            </button>
            <button onclick="window.print()">
                <i class="fas fa-print"></i> Print
            </button>
        `;
        document.body.appendChild(menu);
        
        // Position menu near FAB
        const fabRect = fab.getBoundingClientRect();
        menu.style.bottom = (fabRect.bottom + 10) + 'px';
        menu.style.right = '30px';
        
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!fab.contains(e.target) && !menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    });

    // Toast notification function
    function showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 
                    'info-circle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Initialize skill bars animation
    function animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-bar-fill');
        skillBars.forEach(bar => {
            const percentage = bar.getAttribute('data-percentage') || '0';
            setTimeout(() => {
                bar.style.width = percentage + '%';
            }, 200);
        });
    }

    // Trigger skill bar animation when in viewport
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const skillBarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkillBars();
                skillBarObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe skill bars section
    const skillBarsSection = document.querySelector('.skill-bars');
    if (skillBarsSection) {
        skillBarObserver.observe(skillBarsSection);
    }

    // Camera functionality
    async function initCamera() {
        try {
            if (cameraModal) cameraModal.classList.add('loading');
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user' 
                } 
            });
            if (video) video.srcObject = stream;
            if (cameraModal) cameraModal.classList.remove('loading');
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Could not access the camera. Please make sure you have granted camera permissions.');
            closeCamera();
        }
    }

    function closeCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            stream = null;
        }
        cameraModal.style.display = 'none';
    }

    // Open camera modal
    if (cameraBtn) {
        cameraBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            cameraModal.style.display = 'flex';
            await initCamera();
            
            // Reset UI state
            video.style.display = 'block';
            canvas.style.display = 'none';
            captureBtn.style.display = 'inline-flex';
            retakeBtn.style.display = 'none';
            saveBtn.style.display = 'none';
        });
    }

    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            closeCamera();
        });
    }

    // Capture photo
    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Switch to preview mode
            video.style.display = 'none';
            canvas.style.display = 'block';
            captureBtn.style.display = 'none';
            retakeBtn.style.display = 'inline-flex';
            saveBtn.style.display = 'inline-flex';
            
            // Stop camera stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        });
    }

    // Retake photo
    if (retakeBtn) {
        retakeBtn.addEventListener('click', async () => {
            video.style.display = 'block';
            canvas.style.display = 'none';
            captureBtn.style.display = 'inline-flex';
            retakeBtn.style.display = 'none';
            saveBtn.style.display = 'none';
            await initCamera();
        });
    }

    // Save photo
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (profilePicture) {
                // Convert canvas to data URL and set as profile picture
                const imageDataUrl = canvas.toDataURL('image/png');
                profilePicture.src = imageDataUrl;
                
                // Here you would typically upload the image to your server
                // For now, we'll just store it in localStorage
                try {
                    localStorage.setItem('profilePicture', imageDataUrl);
                } catch (e) {
                    console.warn('Could not save image to localStorage:', e);
                }
                
                // Close the modal
                closeCamera();
                
                // Show success message
                alert('Profile picture updated successfully!');
            }
        });
    }
    
    // Load saved profile picture if exists
    window.addEventListener('load', () => {
        try {
            const savedImage = localStorage.getItem('profilePicture');
            if (savedImage && profilePicture) {
                profilePicture.src = savedImage;
            }
        } catch (e) {
            console.warn('Could not load image from localStorage:', e);
        }
    });

    // Toggle Sidebar if menuToggle exists
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar) sidebar.classList.toggle('active');
            if (mainContent) mainContent.classList.toggle('full-width');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 && sidebar && menuToggle) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
                if (mainContent) mainContent.classList.remove('full-width');
            }
        }
    });

    // Navigation active state
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Prevent default only for anchor links
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }
            
            // Remove active class from all items
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');

            // Close sidebar on mobile after clicking a link
            if (window.innerWidth <= 992 && sidebar) {
                sidebar.classList.remove('active');
                if (mainContent) mainContent.classList.remove('full-width');
            }
        });
    });

    // Initialize with home active if no hash in URL
    if (!window.location.hash) {
        const homeLink = document.querySelector('.nav-link[href="#"]');
        if (homeLink) homeLink.classList.add('active');
    }

    // Replace with your profile picture
    // if (profilePicture) {
    //     profilePicture.src = 'your-photo.jpg';
    // }

    });

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Scroll Reveal Animation
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal, .about-content, .timeline-item');
    
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const revealTop = reveals[i].getBoundingClientRect().top;
        const revealPoint = 150;
        
        if (revealTop < windowHeight - revealPoint) {
            reveals[i].classList.add('visible');
        }
    }
}

window.addEventListener('scroll', revealOnScroll);

// Initialize scroll reveal on page load
window.addEventListener('load', () => {
    // Trigger initial reveal for elements in viewport
    revealOnScroll();
    
    // Add visible class to about content with a slight delay
    setTimeout(() => {
        document.querySelector('.about-content').classList.add('visible');
    }, 300);
    
    // Add visible class to timeline items with staggered delay
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, 500 + (index * 200));
    });
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Here you would typically send the form data to a server
        console.log('Form submitted:', { name, email, message });
        
        // Show success message
        alert('Thank you for your message! I will get back to you soon.');
        this.reset();
    });
}

// Add animation to navigation on scroll
let lastScroll = 0;
const navbar = document.querySelector('nav');
const navMenu = document.querySelector('.nav-menu');

if (navbar) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            return;
        }
        
        if (currentScroll > lastScroll && navMenu && !navMenu.classList.contains('active')) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
        
        lastScroll = currentScroll;
    });
}

// Add animation to navigation items on hover
const navItems = document.querySelectorAll('.nav-link');

navItems.forEach(item => {
    item.addEventListener('mouseover', () => {
        item.style.transform = 'translateX(5px)';
        item.style.transition = 'transform 0.3s ease';
    });
    
    item.addEventListener('mouseout', () => {
        item.style.transform = 'translateX(0)';
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.overflow = 'hidden';
    
    // Simulate loading time
    setTimeout(() => {
        document.querySelector('.loading-screen').style.opacity = '0';
        document.body.style.overflow = 'auto';
        
        setTimeout(() => {
            document.querySelector('.loading-screen').style.display = 'none';
        }, 500);
    }, 1500);
});

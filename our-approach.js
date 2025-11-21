// Smooth scroll behavior and interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add click handlers for navigation items
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Add smooth scroll effect
            this.style.transition = 'transform 0.2s ease';
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });
    
    // Add scroll reveal animations for sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for scroll animations
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Add hover effects to links
    const links = document.querySelectorAll('.link-blue, .link-default');
    links.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'opacity 0.2s ease';
            this.style.opacity = '0.7';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    });
});





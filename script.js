document.addEventListener('DOMContentLoaded', () => {
    
    // Interactive Timeline Logic
    const nodes = document.querySelectorAll('.timeline-node');
    const panels = document.querySelectorAll('.accomplishments-panel');

    nodes.forEach(node => {
        node.addEventListener('click', () => {
            // Remove active class from all nodes and panels
            nodes.forEach(n => n.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Add active class to clicked node
            node.classList.add('active');

            // Find corresponding panel by data-target
            const targetId = node.getAttribute('data-target');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // Reveal on Scroll Animation for Sections
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const layers = document.querySelectorAll('.section-layer');
    layers.forEach(layer => {
        layer.style.opacity = '0';
        layer.style.transform = 'translateY(30px)';
        layer.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(layer);
    });

    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;
            
            btn.innerText = 'Sending...';
            btn.disabled = true;

            // Simulate form submission
            setTimeout(() => {
                alert('Thank you for reaching out, Jeremy will be in touch soon!');
                contactForm.reset();
                btn.innerText = originalText;
                btn.disabled = false;
            }, 1500);
        });
    }
});

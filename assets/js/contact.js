const Contact = {
    // Initialize contact form
    init: function () {
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    },

    // Handle form submission
    handleSubmit: function (e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
        };

        // Validate form
        if (!this.validateForm(data)) {
            return;
        }

        // Simulate form submission
        this.submitForm(data);
    },

    // Validate form data
    validateForm: function (data) {
        const errors = [];

        if (!data.name || data.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (!data.email || !this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!data.message || data.message.trim().length < 10) {
            errors.push('Message must be at least 10 characters long');
        }

        if (errors.length > 0) {
            alert('Please fix the following errors:\n' + errors.join('\n'));
            return false;
        }

        return true;
    },

    // Check if email is valid
    isValidEmail: function (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Submit form (simulation)
    submitForm: function (data) {
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Show success message
            alert('Thank you for your message! We will get back to you soon.');

            // Reset form
            document.getElementById('contactForm').reset();
        }, 1500);
    },
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    Contact.init();
});

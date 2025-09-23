document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Switcher Logic ---
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const currentTheme = localStorage.getItem('theme');

    // Function to apply the theme
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    // On initial load, apply the saved theme or default to light
    if (currentTheme) {
        applyTheme(currentTheme);
    } else {
        applyTheme('light'); // Default theme
    }

    themeToggleButton.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    const cartButton = document.getElementById('open-purchase-modal-btn');
    const recipeCards = document.querySelectorAll('.recipe-card');
    let previouslyFocusedElement;

    // Function to open a modal
    const openModal = (modal, card) => {
        if (modal == null) return;
        previouslyFocusedElement = card; // Save the element that opened the modal
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        modal.querySelector('.close-button').focus(); // Move focus to the close button
    };

    // Function to close a modal
    const closeModal = (modal) => {
        if (modal == null) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');

        // Stop YouTube video from playing when modal is closed
        const iframe = modal.querySelector('iframe');
        if (iframe) {
            const iframeSrc = iframe.src;
            iframe.src = iframeSrc;
        }

        if (previouslyFocusedElement) {
            previouslyFocusedElement.focus(); // Return focus to the card that opened the modal
        }
    };

    // Add listener to the floating cart button
    cartButton.addEventListener('click', () => {
        const purchaseModal = document.getElementById('purchase-modal');
        openModal(purchaseModal, cartButton);
    });

    // Add listeners to each recipe card
    recipeCards.forEach(card => {
        // Open on click
        card.addEventListener('click', () => {
            const modal = document.querySelector(card.dataset.modalTarget);
            openModal(modal, card);
        });

        // Open on Enter/Space key for keyboard users
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent space from scrolling the page
                const modal = document.querySelector(card.dataset.modalTarget);
                openModal(modal, card);
            }
        });
    });

    // Add listeners to all modals
    document.querySelectorAll('.modal').forEach(modal => {
        // Close when clicking the overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });

        // Close when clicking the close button
        modal.querySelector('.close-button').addEventListener('click', () => {
            closeModal(modal);
        });

        // Trap focus inside the modal
        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) { // if shift + tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // if tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        });
    });

    // Close any active modal on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });

    // --- Hamburger Menu Logic ---
    const navToggle = document.querySelector('.nav-toggle');
    const primaryNav = document.querySelector('.main-nav');

    navToggle.addEventListener('click', () => {
        const isVisible = primaryNav.getAttribute('data-visible') === 'true';
        primaryNav.setAttribute('data-visible', !isVisible);
        navToggle.setAttribute('aria-expanded', !isVisible);
    });

    // Close menu when a nav link is clicked
    primaryNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            primaryNav.setAttribute('data-visible', false);
            navToggle.setAttribute('aria-expanded', false);
        }
    });

    // --- Purchase Form Logic ---
    const purchaseForm = document.getElementById('purchase-form');
    const purchaseModal = document.getElementById('purchase-modal');
    if (purchaseForm) {
        const quantityValueInput = document.getElementById('quantity-value');
        const quantityUnitSelect = document.getElementById('quantity-unit');
        const totalCostSpan = document.getElementById('total-cost');

        const prices = {
            kg: 449, // Price per kg
            g: 0.449 // Price per gram (449 / 1000)
        };

        const updateQuantityInputAttributes = (unit) => {
            if (unit === 'kg') {
                quantityValueInput.min = '0.25';
                quantityValueInput.step = '0.25'; // Allow 250g increments when in kg mode
                quantityValueInput.max = '10'; // Maximum 10kg
                quantityValueInput.value = '1'; // Default to 1kg when switching to kg
            } else { // 'g'
                quantityValueInput.min = '250';
                quantityValueInput.step = '250';
                quantityValueInput.max = '10000'; // Maximum 10kg = 10000g
                quantityValueInput.value = '250'; // Default to minimum when switching to g
            }
        };

        const calculateCost = () => {
            const value = parseFloat(quantityValueInput.value);
            const unit = quantityUnitSelect.value;
            if (isNaN(value) || value <= 0) {
                totalCostSpan.textContent = `₹0.00 / ${unit}`; // Display unit even for 0 cost
                return;
            }
            const cost = value * prices[unit];
            totalCostSpan.textContent = `₹${cost.toFixed(2)} / ${value} ${unit}`;
        };

        // Event Listeners
        quantityUnitSelect.addEventListener('change', () => {
            updateQuantityInputAttributes(quantityUnitSelect.value);
            calculateCost();
        });

        quantityValueInput.addEventListener('input', calculateCost);

        // Initial setup on page load
        updateQuantityInputAttributes(quantityUnitSelect.value);
        calculateCost();

        purchaseForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission

            const quantityValue = quantityValueInput.value;
            const quantityUnit = quantityUnitSelect.value;
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            const totalCost = totalCostSpan.textContent;

            const recipientNumber = '919347442664'; // Your WhatsApp number from the footer

            // Construct the message with all order details
            const message = `New Order from Shroom Farms Website:\n-----------------------------------\n\n*Product:* Milky Mushroom\n*Quantity:* ${quantityValue} ${quantityUnit}\n*Total Cost:* ${totalCost}\n\n*Customer Details:*\n*Name:* ${name}\n*Phone:* ${phone}\n*Address:* ${address}`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/${recipientNumber}?text=${encodedMessage}`;

            // Open WhatsApp in a new tab
            window.open(whatsappURL, '_blank');

            // Reset the form and close the modal
            purchaseForm.reset();
            closeModal(purchaseModal);
            updateQuantityInputAttributes(quantityUnitSelect.value);
            calculateCost();
        });
    }
});
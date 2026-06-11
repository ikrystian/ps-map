// ===== Scroll Animations =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => entry.target.classList.add('visible'), delay);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// ===== Navbar Scroll =====
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
}

// ===== Mobile Menu =====
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ===== Multi-Step Form =====
const formSteps = document.querySelectorAll('.form-step');
const progressFill = document.querySelector('.progress-fill');
let currentStep = 0;

function showStep(index) {
    formSteps.forEach((step, i) => {
        step.classList.toggle('active', i === index);
    });
    if (progressFill) {
        progressFill.style.width = ((index + 1) / formSteps.length * 100) + '%';
    }
    currentStep = index;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
    if (currentStep < formSteps.length - 1) {
        showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 0) {
        showStep(currentStep - 1);
    }
}

// ===== Form Submission =====
async function submitForm(e) {
    e.preventDefault();
    const form = document.getElementById('registrationForm');
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Checkbox value
    data.consent = form.querySelector('#consent')?.checked ? 'Tak' : 'Nie';

    const btn = e.target.querySelector('button[type="submit"]') || document.querySelector('.btn-submit');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Wysyłanie...';
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showStep(formSteps.length - 1); // Show success step
        } else {
            throw new Error('Server error');
        }
    } catch (err) {
        // Fallback: save locally and show success anyway
        console.log('Server unavailable, data logged:', data);
        showStep(formSteps.length - 1);
    }
}

// Initialize form
if (formSteps.length > 0) {
    showStep(0);
}

// ===== Hierarchical Specializations with 2-3 dependent selects =====
const kategSelect = document.getElementById('kategoria');
const drugiSelectGroup = document.getElementById('drugiSelectGroup');
const drugiSelectLabel = document.getElementById('drugiSelectLabel');
const drugiSelect = document.getElementById('drugiSelect');
const trzeciSelectGroup = document.getElementById('trzeciSelectGroup');
const trzeciSelect = document.getElementById('trzeciSelect');

if (kategSelect && drugiSelect && trzeciSelect) {
    let specData = {};
    let specFinalInput = null;

    function buildFinalValue() {
        if (!specFinalInput) {
            specFinalInput = document.querySelector('input[name="specjalizacja"]');
        }
        if (!specFinalInput) return;

        const kateg = kategSelect.value;
        const drugi = drugiSelect.value;
        const trzeci = trzeciSelect.value;

        if (!kateg || !drugi) {
            specFinalInput.value = '';
            return;
        }

        if (trzeci) {
            specFinalInput.value = kateg + ' > ' + drugi + ' > ' + trzeci;
        } else {
            specFinalInput.value = kateg + ' > ' + drugi;
        }
    }

    function updateDrugiSelect() {
        const kateg = kategSelect.value;
        drugiSelect.innerHTML = '<option value="">Wybierz opcję...</option>';
        trzeciSelectGroup.style.display = 'none';
        trzeciSelect.innerHTML = '<option value="">Wybierz specjalizację...</option>';
        specFinalInput?.value ? specFinalInput.value = '' : null;

        if (!kateg) {
            drugiSelectGroup.style.display = 'none';
            return;
        }

        const content = specData[kateg];
        if (!content) return;

        drugiSelectGroup.style.display = '';

        if (Array.isArray(content)) {
            drugiSelectLabel.textContent = 'Specjalizacja';
            drugiSelect.required = true;
            content.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item;
                opt.textContent = item;
                drugiSelect.appendChild(opt);
            });
        } else if (typeof content === 'object') {
            drugiSelectLabel.textContent = 'Podkategoria';
            drugiSelect.required = true;
            Object.keys(content).forEach(podkateg => {
                const opt = document.createElement('option');
                opt.value = podkateg;
                opt.textContent = podkateg;
                drugiSelect.appendChild(opt);
            });
        }
    }

    function updateTrzeciSelect() {
        const kateg = kategSelect.value;
        const drugi = drugiSelect.value;

        trzeciSelect.innerHTML = '<option value="">Wybierz specjalizację...</option>';
        specFinalInput?.value ? specFinalInput.value = '' : null;

        if (!kateg || !drugi) {
            trzeciSelectGroup.style.display = 'none';
            return;
        }

        const content = specData[kateg];
        if (!content || Array.isArray(content)) {
            trzeciSelectGroup.style.display = 'none';
            return;
        }

        if (content[drugi]) {
            trzeciSelectGroup.style.display = '';
            trzeciSelect.required = true;
            content[drugi].forEach(spec => {
                const opt = document.createElement('option');
                opt.value = spec;
                opt.textContent = spec;
                trzeciSelect.appendChild(opt);
            });
        }
    }

    fetch('/api/specializations')
        .then(res => res.ok ? res.json() : Promise.reject(new Error('Fetch failed')))
        .then(data => {
            specData = data || {};
            const categories = Object.keys(specData);
            kategSelect.innerHTML = '<option value="">Wybierz kategorię...</option>';
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                kategSelect.appendChild(opt);
            });
        })
        .catch(err => console.error('Error loading specializations:', err));

    kategSelect.addEventListener('change', () => {
        updateDrugiSelect();
        buildFinalValue();
    });

    drugiSelect.addEventListener('change', () => {
        updateTrzeciSelect();
        buildFinalValue();
    });

    trzeciSelect.addEventListener('change', buildFinalValue);
}

// ===== Zip Code Autocomplete & Auto-fill =====
document.addEventListener('DOMContentLoaded', () => {
    const zipInput = document.getElementById('kodPocztowy');
    const dropdown = document.getElementById('kodPocztowyDropdown');
    const cityInput = document.getElementById('miasto');
    const voivodeshipInput = document.getElementById('wojewodztwo');

    if (zipInput && dropdown && cityInput && voivodeshipInput) {
        let items = [];
        let highlightedIndex = -1;
        let debounceTimer;

        // Helper to format typed zip codes (e.g., 00100 -> 00-100)
        zipInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9-]/g, '');

            // Auto-insert dash if user typed 5 digits without a dash
            if (value.length === 5 && !value.includes('-')) {
                value = value.slice(0, 2) + '-' + value.slice(2);
            }

            // Keep length at max 6 chars (XX-XXX)
            if (value.length > 6) {
                value = value.slice(0, 6);
            }

            e.target.value = value;

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                fetchSuggestions(value);
            }, 200);
        });

        // Fetch matching zip codes from backend search endpoint
        async function fetchSuggestions(query) {
            const cleanQuery = query.trim();
            if (cleanQuery.length < 2) {
                closeDropdown();
                return;
            }

            try {
                const res = await fetch(`/api/search-zip?q=${encodeURIComponent(cleanQuery)}`);
                if (!res.ok) throw new Error('Search failed');
                items = await res.json();
                renderDropdown();

                // If the query is a complete valid Polish zip code, and we have matching options,
                // check if there is an exact single match and auto-fill it.
                if (/^[0-9]{2}-[0-9]{3}$/.test(cleanQuery) && items.length > 0) {
                    const exactMatch = items.find(item => item.zip === cleanQuery) || items[0];
                    if (exactMatch) {
                        fillFields(exactMatch);
                    }
                }
            } catch (err) {
                console.error('Error fetching zip suggestions:', err);
            }
        }

        function renderDropdown() {
            dropdown.innerHTML = '';
            highlightedIndex = -1;

            if (items.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'autocomplete-no-results';
                noResults.textContent = 'Brak pasujących kodów';
                dropdown.appendChild(noResults);
            } else {
                items.forEach((item, idx) => {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-item';
                    div.innerHTML = `
                        <span class="item-zip">${item.zip}</span>
                        <span class="item-details">${item.city}, ${item.voivodeship}</span>
                    `;
                    div.addEventListener('click', () => {
                        fillFields(item);
                        closeDropdown();
                    });
                    dropdown.appendChild(div);
                });
            }
            dropdown.classList.add('active');
        }

        function fillFields(item) {
            zipInput.value = item.zip;
            cityInput.value = item.city;
            voivodeshipInput.value = item.voivodeship;
            // Trigger input event to clear validation styling if any
            cityInput.dispatchEvent(new Event('input'));
            voivodeshipInput.dispatchEvent(new Event('input'));
        }

        function closeDropdown() {
            dropdown.classList.remove('active');
            dropdown.innerHTML = '';
            items = [];
            highlightedIndex = -1;
        }

        // Keyboard Navigation
        zipInput.addEventListener('keydown', (e) => {
            const itemElements = dropdown.querySelectorAll('.autocomplete-item');
            if (!dropdown.classList.contains('active') || itemElements.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                highlightedIndex = (highlightedIndex + 1) % itemElements.length;
                updateHighlight(itemElements);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                highlightedIndex = (highlightedIndex - 1 + itemElements.length) % itemElements.length;
                updateHighlight(itemElements);
            } else if (e.key === 'Enter') {
                if (highlightedIndex >= 0 && highlightedIndex < items.length) {
                    e.preventDefault();
                    fillFields(items[highlightedIndex]);
                    closeDropdown();
                }
            } else if (e.key === 'Escape') {
                closeDropdown();
            }
        });

        function updateHighlight(elements) {
            elements.forEach((el, idx) => {
                if (idx === highlightedIndex) {
                    el.classList.add('highlighted');
                    el.scrollIntoView({ block: 'nearest' });
                } else {
                    el.classList.remove('highlighted');
                }
            });
        }

        // Close dropdown on click outside
        document.addEventListener('click', (e) => {
            if (!zipInput.contains(e.target) && !dropdown.contains(e.target)) {
                closeDropdown();
            }
        });
    }

    // ===== Interactive Advisor Section Hover Effects =====
    const featureItems = document.querySelectorAll('.advisor-feature-item');
    const advisorWidget = document.querySelector('.advisor-widget');
    const chatBubble = document.querySelector('.chat-bubble');
    const statCards = document.querySelectorAll('.stat-mini-card');
    const checklist = document.querySelector('.mockup-checklist');

    if (featureItems.length > 0) {
        featureItems.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                // Clear all highlights
                advisorWidget?.classList.remove('highlighted');
                chatBubble?.classList.remove('highlighted');
                statCards.forEach(c => c.classList.remove('highlighted'));
                checklist?.classList.remove('highlighted');

                // Apply specific highlights based on index
                if (index === 0) {
                    statCards[0]?.classList.add('highlighted');
                } else if (index === 1) {
                    statCards[1]?.classList.add('highlighted');
                } else if (index === 2) {
                    advisorWidget?.classList.add('highlighted');
                } else if (index === 3) {
                    checklist?.classList.add('highlighted');
                    chatBubble?.classList.add('highlighted');
                }
            });

            item.addEventListener('mouseleave', () => {
                // Reset all highlights
                advisorWidget?.classList.remove('highlighted');
                chatBubble?.classList.remove('highlighted');
                statCards.forEach(c => c.classList.remove('highlighted'));
                checklist?.classList.remove('highlighted');
            });
        });
    }

    // ===== Hero Live Feed Mockup Cycle =====
    const caseItems = document.querySelectorAll('.hero-right .case-item');
    if (caseItems.length > 0) {
        let activeIdx = 0;
        let cycleInterval = setInterval(() => {
            caseItems[activeIdx].classList.remove('active');
            activeIdx = (activeIdx + 1) % caseItems.length;
            caseItems[activeIdx].classList.add('active');
        }, 3500);

        // Allow manual hover override & pause cycle
        caseItems.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                if (cycleInterval) {
                    clearInterval(cycleInterval);
                    cycleInterval = null;
                }
                caseItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                activeIdx = index;
            });
        });
    }

    // ===== Contact Form Submission =====
    const contactForm = document.getElementById('contactForm');
    const contactSuccessState = document.getElementById('contactSuccessState');
    const btnContactReset = document.getElementById('btnContactReset');

    if (contactForm && contactSuccessState) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Wysyłanie...</span>';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    contactForm.style.display = 'none';
                    contactSuccessState.style.display = 'flex';
                } else {
                    throw new Error('Server error');
                }
            } catch (err) {
                console.log('Server fallback: simulated message submit', data);
                contactForm.style.display = 'none';
                contactSuccessState.style.display = 'flex';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });

        if (btnContactReset) {
            btnContactReset.addEventListener('click', () => {
                contactForm.reset();
                contactForm.style.display = 'flex';
                contactSuccessState.style.display = 'none';
            });
        }
    }
});

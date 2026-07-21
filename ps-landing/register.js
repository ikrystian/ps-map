// ===== Rejestracja eksperta (formularz.html) =====
// Tworzy konto eksperta bezpośrednio w głównej aplikacji (Next.js) bez maila
// aktywacyjnego. Dane słownikowe (województwa, kategorie, specjalizacje, miasta)
// pobierane są z tej samej aplikacji.
// Adres API nadpisujesz bez edycji tego pliku, ustawiając przed załadowaniem skryptu:
//   <script>window.PS_API_BASE = "https://prostasprawa.pl"</script>
// Przy wdrożeniu produkcyjnym ustaw PS_API_BASE na adres produkcyjny (nie zostawiaj stage!).
const API_BASE = window.PS_API_BASE || "https://prostasprawa.pl";

// ===== Multi-step =====
const formSteps = document.querySelectorAll(".form-step");
const progressFill = document.querySelector(".progress-fill");
let currentStep = 0;

function showStep(index) {
    formSteps.forEach((step, i) => step.classList.toggle("active", i === index));
    if (progressFill) {
        progressFill.style.width = ((index + 1) / formSteps.length * 100) + "%";
    }
    currentStep = index;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function getFieldErrorMessage(input) {
    if (input.type === "checkbox") {
        if (input.required && !input.checked) {
            return input.dataset.errorRequired || "To pole jest wymagane.";
        }
        return "";
    }

    const val = input.value.trim();

    if (input.required && !val) {
        return input.dataset.errorRequired || "To pole jest wymagane.";
    }

    if (val && input.minLength && val.length < input.minLength) {
        return input.dataset.errorMinlength || `Pole musi zawierać co najmniej ${input.minLength} znaków.`;
    }

    if (val && input.pattern) {
        const regex = new RegExp("^" + input.pattern + "$");
        if (!regex.test(val)) {
            return input.dataset.errorPattern || input.title || "Niepoprawny format danych.";
        }
    }

    if (val && input.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
            return input.dataset.errorType || "Wpisz poprawny adres e-mail.";
        }
    }

    if (input.id === "confirmPassword") {
        const pass = document.getElementById("password")?.value || "";
        if (val !== pass) {
            return input.dataset.errorMismatch || "Hasła nie są identyczne.";
        }
    }

    if (!input.checkValidity()) {
        return input.validationMessage || "Niepoprawna wartość.";
    }

    return "";
}

function showFieldError(input, message) {
    input.classList.add("input-error");
    if (input.id === "miasto") {
        const btn = document.getElementById("miastoSelectBtn");
        if (btn) btn.classList.add("input-error");
    }
    const checkboxGroup = input.closest(".form-checkbox");
    if (checkboxGroup) {
        checkboxGroup.classList.add("input-error");
    }

    const errorEl = document.getElementById(`error-${input.id}`);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add("active");
    } else {
        const group = input.closest(".form-group");
        if (group) {
            const fe = group.querySelector(".field-error");
            if (fe) {
                fe.textContent = message;
                fe.classList.add("active");
            }
        }
    }
}

function clearFieldError(input) {
    input.classList.remove("input-error");
    if (input.id === "miasto") {
        const btn = document.getElementById("miastoSelectBtn");
        if (btn) btn.classList.remove("input-error");
    }
    const checkboxGroup = input.closest(".form-checkbox");
    if (checkboxGroup) {
        checkboxGroup.classList.remove("input-error");
    }

    const errorEl = document.getElementById(`error-${input.id}`);
    if (errorEl) {
        errorEl.textContent = "";
        errorEl.classList.remove("active");
    } else {
        const group = input.closest(".form-group");
        if (group) {
            const fe = group.querySelector(".field-error");
            if (fe) {
                fe.textContent = "";
                fe.classList.remove("active");
            }
        }
    }
}

function validateActiveStep() {
    const activeStep = formSteps[currentStep];
    const inputs = activeStep.querySelectorAll("input, select, textarea");
    let isValid = true;
    let firstInvalidInput = null;

    inputs.forEach((input) => {
        if (input.disabled) return;

        if (input.id === "confirmPassword") {
            const pass = document.getElementById("password")?.value || "";
            if (input.value !== pass) {
                input.setCustomValidity("Hasła nie są identyczne");
            } else {
                input.setCustomValidity("");
            }
        }

        const errorMessage = getFieldErrorMessage(input);
        if (errorMessage) {
            showFieldError(input, errorMessage);
            isValid = false;
            if (!firstInvalidInput) {
                firstInvalidInput = input.id === "miasto" ? document.getElementById("miastoSelectBtn") : input;
            }
        } else {
            clearFieldError(input);
        }
    });

    if (!isValid && firstInvalidInput) {
        firstInvalidInput.focus();
    }

    return isValid;
}

function nextStep() {
    if (!validateActiveStep()) return;
    if (currentStep < formSteps.length - 1) {
        showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 0) {
        showStep(currentStep - 1);
    }
}

if (formSteps.length > 0) {
    showStep(0);
}

// ===== Pola =====
const kategoriaSelect = document.getElementById("kategoriaEkspert");
const podkategoriaGroup = document.getElementById("podkategoriaGroup");
const podkategoriaSelect = document.getElementById("podkategoriaEkspert");
const specjalizacjaGroup = document.getElementById("specjalizacjaGroup");
const specjalizacjaSelect = document.getElementById("specjalizacjaEkspert");
const expertiseCategoryIdInput = document.getElementById("expertiseCategoryId");
const typInnyInput = document.getElementById("typInny");
const glownaSpecjalizacjaSelect = document.getElementById("glownaSpecjalizacja");
const wojewodztwoSelect = document.getElementById("wojewodztwoSelect");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

// ===== Hierarchiczne specjalizacje (expertise-categories) =====
let expertiseTree = [];

function clearExpertiseLeaf() {
    expertiseCategoryIdInput.value = "";
    typInnyInput.value = "";
}

function fillSelect(select, items, placeholder) {
    select.innerHTML = `<option value="">${placeholder}</option>`;
    items.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.nazwa;
        select.appendChild(opt);
    });
}

// Czy kategoria ma realne podkategorie (dziecko, które samo ma dzieci)?
function hasSubcategories(cat) {
    return Array.isArray(cat.children) &&
        cat.children.some((ch) => Array.isArray(ch.children) && ch.children.length > 0);
}

function selectedLeafPath() {
    const cat = expertiseTree.find((c) => c.id === kategoriaSelect.value);
    if (!cat) return "";
    const parts = [cat.nazwa];
    if (hasSubcategories(cat)) {
        const sub = (cat.children || []).find((s) => s.id === podkategoriaSelect.value);
        if (sub) parts.push(sub.nazwa);
        const leaf = (sub?.children || []).find((l) => l.id === specjalizacjaSelect.value);
        if (leaf) parts.push(leaf.nazwa);
    } else {
        const leaf = (cat.children || []).find((l) => l.id === specjalizacjaSelect.value);
        if (leaf) parts.push(leaf.nazwa);
    }
    return parts.join(" > ");
}

function rebuildExpertiseLeaf() {
    expertiseCategoryIdInput.value = specjalizacjaSelect.value || "";
    typInnyInput.value = specjalizacjaSelect.value ? selectedLeafPath() : "";
}

function onKategoriaChange() {
    const cat = expertiseTree.find((c) => c.id === kategoriaSelect.value);
    podkategoriaGroup.style.display = "none";
    podkategoriaSelect.required = false;
    specjalizacjaGroup.style.display = "none";
    specjalizacjaSelect.required = false;
    clearExpertiseLeaf();

    if (!cat) return;

    if (hasSubcategories(cat)) {
        fillSelect(podkategoriaSelect, cat.children || [], "Wybierz podkategorię...");
        podkategoriaGroup.style.display = "";
        podkategoriaSelect.required = true;
    } else {
        fillSelect(specjalizacjaSelect, cat.children || [], "Wybierz specjalizację...");
        specjalizacjaGroup.style.display = "";
        specjalizacjaSelect.required = (cat.children || []).length > 0;
    }
}

function onPodkategoriaChange() {
    const cat = expertiseTree.find((c) => c.id === kategoriaSelect.value);
    const sub = (cat?.children || []).find((s) => s.id === podkategoriaSelect.value);
    specjalizacjaGroup.style.display = "none";
    specjalizacjaSelect.required = false;
    clearExpertiseLeaf();
    if (!sub) return;
    fillSelect(specjalizacjaSelect, sub.children || [], "Wybierz specjalizację...");
    specjalizacjaGroup.style.display = "";
    specjalizacjaSelect.required = (sub.children || []).length > 0;
}

if (kategoriaSelect) {
    kategoriaSelect.addEventListener("change", onKategoriaChange);
    podkategoriaSelect.addEventListener("change", onPodkategoriaChange);
    specjalizacjaSelect.addEventListener("change", rebuildExpertiseLeaf);
}

// ===== Typ rejestracji (osoba prywatna / firma) + dane z Wykazu podatników VAT =====
// Etykiety pól danych firmy (klucze z przedrostkiem COMPANY_) — kolejność tablicy
// = kolejność wyświetlania. Zgodne z formularzem w aplikacji (/rejestracja/ekspert).
const COMPANY_FIELD_LABELS = [
    { key: "COMPANY_name", label: "Nazwa" },
    { key: "COMPANY_nip", label: "NIP" },
    { key: "COMPANY_regon", label: "REGON" },
    { key: "COMPANY_krs", label: "KRS" },
    { key: "COMPANY_statusVat", label: "Status VAT" },
    { key: "COMPANY_workingAddress", label: "Adres działalności" },
    { key: "COMPANY_residenceAddress", label: "Adres siedziby" },
    { key: "COMPANY_registrationLegalDate", label: "Data rejestracji VAT" },
    { key: "COMPANY_removalDate", label: "Data wykreślenia z VAT" },
    { key: "COMPANY_requestId", label: "ID zapytania (MF)" },
    { key: "COMPANY_requestDateTime", label: "Data weryfikacji" },
];

const regTypeOptions = document.querySelectorAll(".reg-type-option");
const companyLookupBox = document.getElementById("companyLookup");
const companyNipInput = document.getElementById("companyNip");
const companyLookupBtn = document.getElementById("companyLookupBtn");
const companyLookupError = document.getElementById("companyLookupError");
const companyDataBox = document.getElementById("companyData");
const companyDataList = document.getElementById("companyDataList");

// Stan lookupu: NIP i dane firmy pobrane z /api/company-lookup
let companyNip = "";
let companyData = null;

function isFirmaSelected() {
    const checked = document.querySelector('input[name="regType"]:checked');
    return checked && checked.value === "firma";
}

function onRegTypeChange() {
    regTypeOptions.forEach((option) => {
        const input = option.querySelector('input[name="regType"]');
        option.classList.toggle("selected", !!input && input.checked);
    });
    if (companyLookupBox) {
        companyLookupBox.style.display = isFirmaSelected() ? "" : "none";
    }
}

function renderCompanyData() {
    if (!companyDataBox || !companyDataList) return;
    companyDataList.innerHTML = "";
    if (!companyData) {
        companyDataBox.style.display = "none";
        return;
    }
    COMPANY_FIELD_LABELS.forEach(({ key, label }) => {
        const value = companyData[key];
        if (!value) return;
        const row = document.createElement("div");
        row.className = "company-data-row";
        const dt = document.createElement("dt");
        dt.textContent = label + ":";
        const dd = document.createElement("dd");
        dd.textContent = value;
        row.appendChild(dt);
        row.appendChild(dd);
        companyDataList.appendChild(row);
    });
    companyDataBox.style.display = "";
}

async function handleCompanyLookup() {
    if (companyLookupError) companyLookupError.textContent = "";
    const nip = (companyNipInput?.value || "").replace(/[-\s]/g, "");
    if (!/^\d{10}$/.test(nip)) {
        if (companyLookupError) companyLookupError.textContent = "Podaj poprawny numer NIP (10 cyfr).";
        return;
    }

    if (companyLookupBtn) {
        companyLookupBtn.disabled = true;
        companyLookupBtn.textContent = "Wyszukiwanie...";
    }

    try {
        const response = await fetch(`${API_BASE}/api/company-lookup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nip }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            companyData = null;
            renderCompanyData();
            if (companyLookupError) {
                companyLookupError.textContent = data.error || "Nie udało się pobrać danych firmy.";
            }
            return;
        }

        companyNip = data.data.nip || nip;
        companyData = data.data;
        renderCompanyData();
    } catch (err) {
        companyData = null;
        renderCompanyData();
        if (companyLookupError) {
            companyLookupError.textContent = "Wystąpił błąd podczas pobierania danych firmy.";
        }
    } finally {
        if (companyLookupBtn) {
            companyLookupBtn.disabled = false;
            companyLookupBtn.textContent = "Wyszukaj dane firmy";
        }
    }
}

document.querySelectorAll('input[name="regType"]').forEach((radio) => {
    radio.addEventListener("change", onRegTypeChange);
});
if (companyLookupBtn) {
    companyLookupBtn.addEventListener("click", handleCompanyLookup);
}
if (companyNipInput) {
    companyNipInput.addEventListener("input", () => {
        if (companyLookupError) companyLookupError.textContent = "";
    });
}

// ===== Ładowanie danych słownikowych =====
async function loadReferenceData() {
    try {
        const [vRes, cRes, eRes] = await Promise.all([
            fetch(`${API_BASE}/api/voivodeships`),
            fetch(`${API_BASE}/api/categories`),
            fetch(`${API_BASE}/api/expertise-categories`),
        ]);

        if (vRes.ok && wojewodztwoSelect) {
            const voivodeships = await vRes.json();
            voivodeships
                .sort((a, b) => a.nazwa.localeCompare(b.nazwa, "pl"))
                .forEach((v) => {
                    const opt = document.createElement("option");
                    opt.value = v.id;
                    opt.textContent = v.nazwa;
                    wojewodztwoSelect.appendChild(opt);
                });
        }

        if (cRes.ok && glownaSpecjalizacjaSelect) {
            const categories = await cRes.json();
            const mainCategories = categories
                .filter((cat) => !cat.parentId)
                .sort((a, b) => a.nazwa.localeCompare(b.nazwa, "pl"));
            // Grupowanie jak w aplikacji (/rejestracja/ekspert): najpierw firmowe, potem prywatne.
            const categoryGroups = [
                { label: "Kategorie firmowe", items: mainCategories.filter((cat) => cat.typ === "SPRAWY_FIRMOWE") },
                { label: "Kategorie prywatne", items: mainCategories.filter((cat) => cat.typ !== "SPRAWY_FIRMOWE") },
            ];
            categoryGroups.forEach(({ label, items }) => {
                if (items.length === 0) return;
                const group = document.createElement("optgroup");
                group.label = label;
                items.forEach((cat) => {
                    const opt = document.createElement("option");
                    opt.value = cat.id;
                    opt.textContent = cat.nazwa;
                    group.appendChild(opt);
                });
                glownaSpecjalizacjaSelect.appendChild(group);
            });
        }

        if (eRes.ok && kategoriaSelect) {
            expertiseTree = await eRes.json();
            fillSelect(kategoriaSelect, expertiseTree, "Wybierz kategorię...");
        }
    } catch (err) {
        console.error("Błąd ładowania danych słownikowych:", err);
    }
}

// ===== Rozwijana lista miast z wyszukiwarką oraz autouzupełnianie po kodzie pocztowym (z /api/cities) =====
function initCityAutocomplete() {
    const zipInput = document.getElementById("kodPocztowy");
    const cityInput = document.getElementById("miasto");
    const citySelectBtn = document.getElementById("miastoSelectBtn");
    const citySelectLabel = document.getElementById("miastoSelectLabel");
    const cityDropdown = document.getElementById("miastoDropdown");
    const citySearchInput = document.getElementById("miastoSearchInput");
    const cityOptionsList = document.getElementById("miastoOptionsList");
    const cityGroup = document.getElementById("miastoGroup");

    if (!zipInput || !cityInput || !citySelectBtn || !cityDropdown || !citySearchInput || !cityOptionsList) return;

    let citiesCache = {};
    let currentCities = [];
    let searchDebounceTimer = null;
    let isLoadingCities = false;

    function selectCity(city, matchedPostalCode) {
        const postalCode = matchedPostalCode || city.postalCodes?.[0]?.code || zipInput.value || "";
        
        cityInput.value = city.nazwa;
        citySelectLabel.textContent = city.nazwa;
        citySelectLabel.classList.remove("placeholder-text");

        if (zipInput && postalCode) {
            zipInput.value = postalCode;
        }

        if (wojewodztwoSelect && city.voivodeshipId) {
            wojewodztwoSelect.value = city.voivodeshipId;
        }

        clearFieldError(cityInput);
        if (zipInput) clearFieldError(zipInput);
        if (wojewodztwoSelect) clearFieldError(wojewodztwoSelect);

        closeCityDropdown();
    }

    function renderCityOptions(citiesList, query) {
        cityOptionsList.innerHTML = "";
        const cleanQuery = (query || "").trim().toLowerCase();

        if (isLoadingCities) {
            cityOptionsList.innerHTML = `<div class="dropdown-status-msg">Wyszukiwanie...</div>`;
            return;
        }

        if (citiesList.length === 0) {
            if (cleanQuery.length < 2 && zipInput.value.length !== 6) {
                cityOptionsList.innerHTML = `<div class="dropdown-status-msg">Wpisz co najmniej 2 znaki...</div>`;
            } else {
                cityOptionsList.innerHTML = `<div class="dropdown-status-msg">Nie znaleziono miasta.</div>`;
            }
            return;
        }

        citiesList.forEach((city) => {
            const matchedPostal = (city.postalCodes || []).find((p) =>
                p.code && p.code.toLowerCase().includes(cleanQuery)
            );
            const postalDisplay = matchedPostal ? matchedPostal.code : (city.postalCodes?.[0]?.code || "");

            const item = document.createElement("div");
            item.className = "select-option-item";
            item.innerHTML = `
                <div class="option-left">
                    <span class="option-city-name">${city.nazwa}</span>
                    ${postalDisplay ? `<span class="option-postal-code">(${postalDisplay})</span>` : ""}
                </div>
                <span class="option-voivodeship-name">${city.voivodeship?.nazwa || ""}</span>
            `;
            item.addEventListener("click", () => {
                selectCity(city, matchedPostal?.code || postalDisplay);
            });
            cityOptionsList.appendChild(item);
        });
    }

    async function fetchCities(query) {
        const cleanQuery = query.trim().toLowerCase();
        if (cleanQuery.length < 2) {
            if (zipInput.value.length === 6) {
                fetchCitiesForPostal(zipInput.value);
            } else {
                currentCities = [];
                renderCityOptions([], cleanQuery);
            }
            return;
        }

        if (citiesCache[cleanQuery]) {
            currentCities = citiesCache[cleanQuery];
            renderCityOptions(currentCities, cleanQuery);
            return;
        }

        isLoadingCities = true;
        renderCityOptions([], cleanQuery);

        try {
            const res = await fetch(`${API_BASE}/api/cities?search=${encodeURIComponent(cleanQuery)}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    citiesCache[cleanQuery] = data;
                    currentCities = data;
                }
            }
        } catch (err) {
            console.error("Błąd pobierania miast:", err);
        } finally {
            isLoadingCities = false;
            renderCityOptions(currentCities, cleanQuery);
        }
    }

    async function fetchCitiesForPostal(postalCode) {
        if (postalCode.length !== 6) return;
        isLoadingCities = true;
        try {
            const res = await fetch(`${API_BASE}/api/cities?search=${encodeURIComponent(postalCode)}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    currentCities = data;
                    if (data.length === 1) {
                        const matched = data[0];
                        cityInput.value = matched.nazwa;
                        citySelectLabel.textContent = matched.nazwa;
                        citySelectLabel.classList.remove("placeholder-text");
                        if (wojewodztwoSelect && matched.voivodeshipId) {
                            wojewodztwoSelect.value = matched.voivodeshipId;
                        }
                        clearFieldError(cityInput);
                        if (wojewodztwoSelect) clearFieldError(wojewodztwoSelect);
                    }
                }
            }
        } catch (err) {
            console.error("Błąd pobierania miast po kodzie pocztowym:", err);
        } finally {
            isLoadingCities = false;
            if (cityDropdown.classList.contains("active")) {
                renderCityOptions(currentCities, citySearchInput.value);
            }
        }
    }

    zipInput.addEventListener("input", (e) => {
        let val = e.target.value.replace(/[^\d]/g, "");
        if (val.length > 5) val = val.slice(0, 5);

        let formatted = val;
        if (val.length > 2) {
            formatted = `${val.slice(0, 2)}-${val.slice(2)}`;
        }
        e.target.value = formatted;

        if (formatted.length < 6) {
            if (cityInput.value) {
                cityInput.value = "";
                citySelectLabel.textContent = "Wybierz miasto...";
                citySelectLabel.classList.add("placeholder-text");
                if (wojewodztwoSelect) wojewodztwoSelect.value = "";
            }
            currentCities = [];
        } else if (formatted.length === 6) {
            fetchCitiesForPostal(formatted);
        }
    });

    function openCityDropdown() {
        cityDropdown.classList.add("active");
        citySelectBtn.classList.add("active");
        citySearchInput.value = "";
        citySearchInput.focus();
        if (zipInput.value.length === 6 && currentCities.length > 0) {
            renderCityOptions(currentCities, "");
        } else {
            renderCityOptions([], "");
        }
    }

    function closeCityDropdown() {
        cityDropdown.classList.remove("active");
        citySelectBtn.classList.remove("active");
    }

    citySelectBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (cityDropdown.classList.contains("active")) {
            closeCityDropdown();
        } else {
            openCityDropdown();
        }
    });

    citySearchInput.addEventListener("input", (e) => {
        clearTimeout(searchDebounceTimer);
        const q = e.target.value;
        searchDebounceTimer = setTimeout(() => fetchCities(q), 250);
    });

    document.addEventListener("click", (e) => {
        if (!cityGroup.contains(e.target)) {
            closeCityDropdown();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && cityDropdown.classList.contains("active")) {
            closeCityDropdown();
        }
    });
}

// ===== Wysyłka =====
async function submitForm(e) {
    e.preventDefault();
    const form = document.getElementById("registrationForm");
    const errorEl = document.getElementById("formError");
    if (errorEl) errorEl.textContent = "";

    if (!validateActiveStep()) return;

    const voivodeshipId = wojewodztwoSelect.value;
    const categoryId = glownaSpecjalizacjaSelect.value;

    const payload = {
        email: document.getElementById("email").value.trim(),
        password: passwordInput.value,
        typ: "INNY",
        typInny: typInnyInput.value || null,
        expertiseCategoryId: expertiseCategoryIdInput.value || null,
        nazwa: document.getElementById("nazwa").value.trim(),
        // NIP pochodzi wyłącznie z lookupu Białej listy (rejestracja "jako firma");
        // dla osoby prywatnej pozostaje null — tak jak w aplikacji.
        nip: companyNip || null,
        regon: null,
        krs: null,
        imieKontakt: document.getElementById("imieKontakt").value.trim(),
        nazwiskoKontakt: document.getElementById("nazwiskoKontakt").value.trim(),
        numerTelefonu: document.getElementById("numerTelefonu").value.trim(),
        numerTelefonu2: document.getElementById("numerTelefonu2").value.trim() || null,
        adres: document.getElementById("adres").value.trim(),
        kodPocztowy: document.getElementById("kodPocztowy").value.trim(),
        miasto: document.getElementById("miasto").value.trim(),
        voivodeshipId,
        typOferty: "WSZYSTKIE",
        zgodaRegulamin: document.getElementById("zgodaRegulamin").checked,
        zgodaPrzetwarzanie: document.getElementById("zgodaPrzetwarzanie").checked,
        calaPolska: false,
        voivodeshipsIds: voivodeshipId ? [voivodeshipId] : [],
        categoriesIds: categoryId ? [categoryId] : [],
        isSocialRegistration: false,
        // Dane firmy z Wykazu podatników VAT (tylko gdy rejestracja "jako firma")
        companyData: isFirmaSelected() ? companyData : null,
        // Pre-rejestracja z landing page: bez maila aktywacyjnego, konto od razu zweryfikowane.
        skipEmailVerification: true,
    };

    const btn = e.target.querySelector('button[type="submit"]') || document.querySelector(".btn-submit");
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Wysyłanie...";
    }

    try {
        const response = await fetch(`${API_BASE}/api/law-firms`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            showStep(formSteps.length - 1); // sukces
            return;
        }
        throw new Error(data.error || "Wystąpił błąd podczas rejestracji");
    } catch (err) {
        if (errorEl) errorEl.textContent = err.message || "Wystąpił błąd podczas rejestracji";
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Zarejestruj się";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadReferenceData();
    initCityAutocomplete();

    const allInputs = document.querySelectorAll(".form-step input, .form-step select");
    allInputs.forEach((input) => {
        const updateValidationState = () => {
            const errorMessage = getFieldErrorMessage(input);
            if (!errorMessage) {
                clearFieldError(input);
            } else if (input.classList.contains("input-error")) {
                showFieldError(input, errorMessage);
            }
        };
        input.addEventListener("input", updateValidationState);
        input.addEventListener("change", updateValidationState);
        input.addEventListener("blur", () => {
            if (input.value.trim() !== "" || input.classList.contains("input-error")) {
                const errorMessage = getFieldErrorMessage(input);
                if (errorMessage) {
                    showFieldError(input, errorMessage);
                } else {
                    clearFieldError(input);
                }
            }
        });
    });
});

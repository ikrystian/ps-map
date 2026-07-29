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
    const customTrigger = input.closest(".form-group")?.querySelector(".custom-select-trigger");
    if (customTrigger) {
        customTrigger.classList.add("input-error");
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
    const customTrigger = input.closest(".form-group")?.querySelector(".custom-select-trigger");
    if (customTrigger) {
        customTrigger.classList.remove("input-error");
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
                const customTrigger = input.closest(".form-group")?.querySelector(".custom-select-trigger");
                firstInvalidInput = customTrigger || (input.id === "miasto" ? document.getElementById("miastoSelectBtn") : input);
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
const glownaSpecjalizacjaSelect = document.getElementById("glownaSpecjalizacja");
const wojewodztwoSelect = document.getElementById("wojewodztwoSelect");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

// ===== Hierarchiczne specjalizacje (expertise-categories) =====
let expertiseTree = [];

function clearExpertiseLeaf() {
    expertiseCategoryIdInput.value = "";
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

function rebuildExpertiseLeaf() {
    expertiseCategoryIdInput.value = specjalizacjaSelect.value || "";
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

// ===== Weryfikacja numeru telefonu kodem SMS =====
// Konto nie powstaje, dopóki numer nie zostanie potwierdzony — endpoint
// /api/law-firms wymaga jednorazowego tokenu wydanego po poprawnym kodzie.
// Modal budujemy w JS, żeby nie ruszać formularz.html.

let phoneModalEl = null;

function buildPhoneModal() {
    if (phoneModalEl) return phoneModalEl;

    const overlay = document.createElement("div");
    overlay.className = "ps-phone-modal-overlay";
    overlay.innerHTML = `
        <div class="ps-phone-modal" role="dialog" aria-modal="true" aria-labelledby="psPhoneTitle">
            <h3 id="psPhoneTitle">Weryfikacja numeru telefonu</h3>
            <p class="ps-phone-desc">Wysyłamy kod SMS na podany numer telefonu…</p>
            <input class="ps-phone-code" type="text" inputmode="numeric" maxlength="6"
                   autocomplete="one-time-code" placeholder="000000" aria-label="Kod z SMS">
            <p class="ps-phone-error" role="alert"></p>
            <div class="ps-phone-simulated" style="display:none;">
                <p class="ps-phone-simulated-label">Tryb symulacji — log serwera</p>
                <p class="ps-phone-simulated-text"></p>
            </div>
            <div class="ps-phone-actions">
                <button type="button" class="ps-phone-cancel">Anuluj</button>
                <button type="button" class="ps-phone-resend">Wyślij ponownie</button>
                <button type="button" class="ps-phone-confirm">Potwierdź</button>
            </div>
        </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
        .ps-phone-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55);
            display: none; align-items: center; justify-content: center; z-index: 9999; padding: 16px; }
        .ps-phone-modal-overlay.active { display: flex; }
        .ps-phone-modal { background: #fff; border-radius: 12px; padding: 28px 24px; max-width: 400px;
            width: 100%; text-align: center; font-family: inherit; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
        .ps-phone-modal h3 { margin: 0 0 8px; font-size: 20px; }
        .ps-phone-desc { margin: 0 0 18px; color: #555; font-size: 14px; line-height: 1.5; }
        .ps-phone-code { width: 100%; padding: 12px; font-size: 24px; letter-spacing: 8px;
            text-align: center; border: 1px solid #ccc; border-radius: 8px; }
        .ps-phone-error { color: #d32f2f; font-size: 13px; min-height: 18px; margin: 10px 0 0; }
        .ps-phone-simulated { text-align: left; background: rgba(245, 158, 11, .1); border: 1px dashed rgba(245, 158, 11, .6);
            border-radius: 8px; padding: 10px 12px; margin: 10px 0 0; }
        .ps-phone-simulated-label { margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #92400e; }
        .ps-phone-simulated-text { margin: 0; font-size: 12px; font-family: monospace; color: #78350f;
            word-break: break-all; }
        .ps-phone-actions { display: flex; gap: 8px; justify-content: center; margin-top: 16px; flex-wrap: wrap; }
        .ps-phone-actions button { padding: 10px 18px; border-radius: 8px; border: 1px solid #ccc;
            background: #fff; cursor: pointer; font-size: 14px; }
        .ps-phone-actions button:disabled { opacity: .5; cursor: not-allowed; }
        .ps-phone-confirm { background: #1a3d7c; color: #fff; border-color: #1a3d7c; }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);
    phoneModalEl = overlay;
    return overlay;
}

/**
 * Pokazuje modal, wysyła kod i czeka na potwierdzenie.
 * @returns {Promise<string|null>} token weryfikacji albo null, gdy użytkownik anulował.
 */
function verifyPhoneNumber(phone) {
    const overlay = buildPhoneModal();
    const desc = overlay.querySelector(".ps-phone-desc");
    const codeInput = overlay.querySelector(".ps-phone-code");
    const errorEl = overlay.querySelector(".ps-phone-error");
    const cancelBtn = overlay.querySelector(".ps-phone-cancel");
    const resendBtn = overlay.querySelector(".ps-phone-resend");
    const confirmBtn = overlay.querySelector(".ps-phone-confirm");
    const simulatedBox = overlay.querySelector(".ps-phone-simulated");
    const simulatedText = overlay.querySelector(".ps-phone-simulated-text");

    codeInput.value = "";
    errorEl.textContent = "";
    simulatedBox.style.display = "none";
    simulatedText.textContent = "";
    overlay.classList.add("active");
    codeInput.focus();

    return new Promise((resolve) => {
        let cooldownTimer = null;

        function cleanup(result) {
            clearInterval(cooldownTimer);
            overlay.classList.remove("active");
            cancelBtn.onclick = null;
            resendBtn.onclick = null;
            confirmBtn.onclick = null;
            codeInput.onkeydown = null;
            resolve(result);
        }

        function startCooldown(seconds) {
            clearInterval(cooldownTimer);
            let left = seconds;
            resendBtn.disabled = true;
            resendBtn.textContent = `Wyślij ponownie (${left}s)`;
            cooldownTimer = setInterval(() => {
                left -= 1;
                if (left <= 0) {
                    clearInterval(cooldownTimer);
                    resendBtn.disabled = false;
                    resendBtn.textContent = "Wyślij ponownie";
                } else {
                    resendBtn.textContent = `Wyślij ponownie (${left}s)`;
                }
            }, 1000);
        }

        async function sendCode() {
            errorEl.textContent = "";
            resendBtn.disabled = true;
            try {
                const response = await fetch(`${API_BASE}/api/auth/phone-verification/send`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone }),
                });
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    errorEl.textContent = data.error || "Nie udało się wysłać kodu SMS.";
                    simulatedBox.style.display = "none";
                    simulatedText.textContent = "";
                    startCooldown(data.retryAfterSeconds || 45);
                    return;
                }

                desc.textContent = data.maskedPhone
                    ? `Kod wysłaliśmy SMS-em na numer ${data.maskedPhone}. Wpisz go poniżej, aby dokończyć rejestrację.`
                    : "Kod został wysłany. Wpisz go poniżej.";

                if (data.simulated && typeof data.simulatedMessage === "string") {
                    simulatedText.textContent = data.simulatedMessage;
                    simulatedBox.style.display = "block";
                } else {
                    simulatedBox.style.display = "none";
                    simulatedText.textContent = "";
                }

                startCooldown(45);
            } catch (err) {
                errorEl.textContent = "Nie udało się wysłać kodu SMS. Sprawdź połączenie.";
                resendBtn.disabled = false;
            }
        }

        async function confirmCode() {
            const code = codeInput.value.trim();
            if (code.length !== 6) {
                errorEl.textContent = "Wpisz 6-cyfrowy kod z SMS-a.";
                return;
            }

            errorEl.textContent = "";
            confirmBtn.disabled = true;
            try {
                const response = await fetch(`${API_BASE}/api/auth/phone-verification/verify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone, code }),
                });
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    const suffix = typeof data.attemptsLeft === "number" && data.attemptsLeft > 0
                        ? ` Pozostało prób: ${data.attemptsLeft}.`
                        : "";
                    errorEl.textContent = (data.error || "Weryfikacja nie powiodła się.") + suffix;
                    codeInput.value = "";
                    codeInput.focus();
                    if (data.canResend) {
                        clearInterval(cooldownTimer);
                        resendBtn.disabled = false;
                        resendBtn.textContent = "Wyślij ponownie";
                    }
                    return;
                }

                cleanup(data.token);
            } catch (err) {
                errorEl.textContent = "Weryfikacja nie powiodła się. Sprawdź połączenie.";
            } finally {
                confirmBtn.disabled = false;
            }
        }

        cancelBtn.onclick = () => cleanup(null);
        resendBtn.onclick = () => { void sendCode(); };
        confirmBtn.onclick = () => { void confirmCode(); };
        codeInput.onkeydown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                void confirmCode();
            }
        };

        void sendCode();
    });
}

// ===== Wysyłka =====
async function submitForm(e) {
    e.preventDefault();
    const form = document.getElementById("registrationForm");
    const errorEl = document.getElementById("formError");
    if (errorEl) errorEl.textContent = "";

    if (!validateActiveStep()) return;

    // Numer telefonu potwierdzamy zanim cokolwiek poleci do API — bez tokenu
    // endpoint rejestracji odrzuci żądanie. Robimy to przed reCAPTCHA, żeby jej
    // token nie zdążył wygasnąć, gdy użytkownik przepisuje kod z SMS-a.
    const phoneVerificationToken = await verifyPhoneNumber(
        document.getElementById("numerTelefonu").value.trim()
    );
    if (!phoneVerificationToken) {
        if (errorEl) errorEl.textContent = "Rejestracja wymaga potwierdzenia numeru telefonu kodem SMS.";
        return;
    }

    const voivodeshipId = wojewodztwoSelect.value;
    const categoryId = glownaSpecjalizacjaSelect.value;

    let recaptchaToken = null;
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
        recaptchaToken = "localhost_bypass_token";
    } else {
        try {
            if (typeof window.grecaptcha !== "undefined") {
                recaptchaToken = await new Promise((resolve) => {
                    window.grecaptcha.ready(async () => {
                        try {
                            const token = await window.grecaptcha.execute("6LciQGMtAAAAAJi1UM1J6DMg4a4KOJl4fgKL3R0a", { action: "register_ekspert" });
                            resolve(token);
                        } catch (err) {
                            console.error("reCAPTCHA execute error:", err);
                            resolve(null);
                        }
                    });
                });
            }
        } catch (err) {
            console.error("reCAPTCHA token error:", err);
        }
    }

    const payload = {
        email: document.getElementById("email").value.trim(),
        password: passwordInput.value,
        recaptchaToken,
        phoneVerificationToken,
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

// ===== Inicjalizacja customowych selectów pasujących do designu portalu =====
function initCustomSelects() {
    const selects = document.querySelectorAll("select.form-select");

    selects.forEach((select) => {
        if (select.dataset.customSelectInitialized) return;
        select.dataset.customSelectInitialized = "true";

        const parentGroup = select.closest(".form-group");
        if (parentGroup) {
            parentGroup.classList.add("dropdown-container");
        }

        select.style.display = "none";

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "form-select custom-select-trigger";
        trigger.setAttribute("aria-haspopup", "listbox");
        trigger.setAttribute("aria-expanded", "false");
        trigger.id = `${select.id}SelectBtn`;

        const labelSpan = document.createElement("span");
        labelSpan.className = "custom-select-label placeholder-text";
        labelSpan.id = `${select.id}SelectLabel`;

        const chevronSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        chevronSvg.setAttribute("class", "select-chevron");
        chevronSvg.setAttribute("width", "16");
        chevronSvg.setAttribute("height", "16");
        chevronSvg.setAttribute("viewBox", "0 0 24 24");
        chevronSvg.setAttribute("fill", "none");
        chevronSvg.setAttribute("stroke", "currentColor");
        chevronSvg.setAttribute("stroke-width", "2");
        chevronSvg.innerHTML = `<path d="M6 9l6 6 6-6"/>`;

        trigger.appendChild(labelSpan);
        trigger.appendChild(chevronSvg);

        const dropdown = document.createElement("div");
        dropdown.className = "custom-select-dropdown";
        dropdown.id = `${select.id}Dropdown`;

        const searchWrapper = document.createElement("div");
        searchWrapper.className = "dropdown-search-wrapper";
        searchWrapper.style.display = "none";

        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.className = "dropdown-search-input";
        searchInput.placeholder = "Szukaj...";
        searchInput.autocomplete = "off";
        searchWrapper.appendChild(searchInput);

        const optionsList = document.createElement("div");
        optionsList.className = "dropdown-options-list";

        dropdown.appendChild(searchWrapper);
        dropdown.appendChild(optionsList);

        select.insertAdjacentElement("afterend", trigger);
        trigger.insertAdjacentElement("afterend", dropdown);

        function updateTriggerLabel() {
            const selectedOpt = select.options[select.selectedIndex];
            const hasVal = selectedOpt && selectedOpt.value !== "";
            labelSpan.textContent = selectedOpt ? selectedOpt.textContent : "Wybierz...";
            if (hasVal) {
                labelSpan.classList.remove("placeholder-text");
            } else {
                labelSpan.classList.add("placeholder-text");
            }

            const currentVal = select.value;
            optionsList.querySelectorAll(".select-option-item").forEach((item) => {
                const isSelected = item.dataset.value === currentVal;
                item.classList.toggle("selected", isSelected);
                const checkIcon = item.querySelector(".option-check-icon");
                if (checkIcon) checkIcon.style.display = isSelected ? "inline-block" : "none";
            });
        }

        function createOptionItem(opt, isOptgroupChild) {
            const item = document.createElement("div");
            item.className = "select-option-item" + (isOptgroupChild ? " is-optgroup-child" : "");
            if (opt.value === "") item.classList.add("is-placeholder-option");
            item.dataset.value = opt.value;

            const textSpan = document.createElement("span");
            textSpan.textContent = opt.textContent;

            const isSelected = opt.value === select.value && select.selectedIndex >= 0;
            if (isSelected) item.classList.add("selected");

            const checkSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            checkSvg.setAttribute("class", "option-check-icon");
            checkSvg.setAttribute("width", "14");
            checkSvg.setAttribute("height", "14");
            checkSvg.setAttribute("viewBox", "0 0 24 24");
            checkSvg.setAttribute("fill", "none");
            checkSvg.setAttribute("stroke", "#0b8c7f");
            checkSvg.setAttribute("stroke-width", "2.5");
            checkSvg.style.display = isSelected ? "inline-block" : "none";
            checkSvg.style.flexShrink = "0";
            checkSvg.innerHTML = `<path d="M5 13l4 4L19 7"/>`;

            item.appendChild(textSpan);
            item.appendChild(checkSvg);

            item.addEventListener("click", (e) => {
                e.stopPropagation();
                select.value = opt.value;
                select.dispatchEvent(new Event("change", { bubbles: true }));
                select.dispatchEvent(new Event("input", { bubbles: true }));
                clearFieldError(select);
                closeDropdown();
            });

            return item;
        }

        function syncOptions() {
            optionsList.innerHTML = "";
            const children = Array.from(select.children);
            let totalOptions = 0;

            children.forEach((child) => {
                if (child.tagName === "OPTGROUP") {
                    const groupLabel = document.createElement("div");
                    groupLabel.className = "dropdown-optgroup-label";
                    groupLabel.textContent = child.label;
                    optionsList.appendChild(groupLabel);

                    Array.from(child.children).forEach((opt) => {
                        if (opt.tagName === "OPTION") {
                            totalOptions++;
                            optionsList.appendChild(createOptionItem(opt, true));
                        }
                    });
                } else if (child.tagName === "OPTION") {
                    totalOptions++;
                    optionsList.appendChild(createOptionItem(child, false));
                }
            });

            if (totalOptions === 0) {
                optionsList.innerHTML = `<div class="dropdown-status-msg">Brak opcji do wyboru</div>`;
            }

            searchWrapper.style.display = totalOptions > 7 ? "block" : "none";
            updateTriggerLabel();
        }

        function filterOptions(query) {
            const cleanQuery = (query || "").trim().toLowerCase();
            const items = optionsList.querySelectorAll(".select-option-item");
            const groupLabels = optionsList.querySelectorAll(".dropdown-optgroup-label");
            let hasMatch = false;

            items.forEach((item) => {
                const matches = item.textContent.toLowerCase().includes(cleanQuery);
                item.style.display = matches ? "flex" : "none";
                if (matches) hasMatch = true;
            });

            groupLabels.forEach((label) => {
                let next = label.nextElementSibling;
                let groupHasVisible = false;
                while (next && next.classList.contains("select-option-item")) {
                    if (next.style.display !== "none") {
                        groupHasVisible = true;
                    }
                    next = next.nextElementSibling;
                }
                label.style.display = groupHasVisible ? "block" : "none";
            });

            let noMatchMsg = optionsList.querySelector(".dropdown-no-match-msg");
            if (!hasMatch && cleanQuery !== "") {
                if (!noMatchMsg) {
                    noMatchMsg = document.createElement("div");
                    noMatchMsg.className = "dropdown-status-msg dropdown-no-match-msg";
                    noMatchMsg.textContent = "Brak pasujących opcji.";
                    optionsList.appendChild(noMatchMsg);
                }
                noMatchMsg.style.display = "block";
            } else if (noMatchMsg) {
                noMatchMsg.style.display = "none";
            }
        }

        searchInput.addEventListener("input", (e) => {
            filterOptions(e.target.value);
        });

        function openDropdown() {
            document.querySelectorAll(".custom-select-dropdown.active").forEach((d) => {
                if (d !== dropdown) d.classList.remove("active");
            });
            document.querySelectorAll(".custom-select-trigger.active").forEach((t) => {
                if (t !== trigger) t.classList.remove("active");
            });

            dropdown.classList.add("active");
            trigger.classList.add("active");

            if (searchWrapper.style.display !== "none") {
                searchInput.value = "";
                filterOptions("");
                setTimeout(() => searchInput.focus(), 50);
            }
        }

        function closeDropdown() {
            dropdown.classList.remove("active");
            trigger.classList.remove("active");
        }

        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dropdown.classList.contains("active")) {
                closeDropdown();
            } else {
                openDropdown();
            }
        });

        document.addEventListener("click", (e) => {
            if (parentGroup && !parentGroup.contains(e.target)) {
                closeDropdown();
            }
        });

        trigger.addEventListener("keydown", (e) => {
            if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!dropdown.classList.contains("active")) {
                    openDropdown();
                }
            } else if (e.key === "Escape") {
                closeDropdown();
            }
        });

        dropdown.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeDropdown();
                trigger.focus();
            }
        });

        const observer = new MutationObserver(() => {
            syncOptions();
        });
        observer.observe(select, { childList: true, subtree: true, characterData: true });

        select.addEventListener("change", updateTriggerLabel);
        select.addEventListener("input", updateTriggerLabel);

        const descriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
        if (descriptor && descriptor.set) {
            Object.defineProperty(select, "value", {
                get() {
                    return descriptor.get.call(this);
                },
                set(val) {
                    descriptor.set.call(this, val);
                    updateTriggerLabel();
                },
                configurable: true,
            });
        }

        syncOptions();
    });
}

function initPasswordToggle() {
    const toggleBtns = document.querySelectorAll(".password-toggle-btn");
    toggleBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const wrapper = btn.closest(".password-wrapper");
            const input = wrapper ? wrapper.querySelector("input") : null;
            if (!input) return;

            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";

            const openIcon = btn.querySelector(".eye-open");
            const closedIcon = btn.querySelector(".eye-closed");

            if (openIcon && closedIcon) {
                openIcon.style.display = isPassword ? "none" : "";
                closedIcon.style.display = isPassword ? "" : "none";
            }

            btn.setAttribute("aria-label", isPassword ? "Ukryj hasło" : "Pokaż hasło");
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initCustomSelects();
    loadReferenceData();
    initCityAutocomplete();
    initPasswordToggle();

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

/**
 * Schönherz Jelenléti Ív Helper Bővítmény
 * 
 * Fő funkciók:
 * 1. Hónap-specifikus óradíj bevitele és mentése a Chrome memóriájába (pl. hourly_rate_2026_10).
 * 2. Napi ledolgozott órák és percek automatikus kiszámítása levonásokkal együtt.
 * 3. Havi összesített óraszám és várható fizetés kiszámítása az adott hónap óradíjával.
 * 4. A mai nap kiemelése és automatikus odagörgetés.
 */

// ============================================================================
// SEGÉDFÜGGVÉNY: ÉV ÉS HÓNAP KINYERÉSE AZ URL-BŐL VAGY A MAI DÁTUMBÓL
// ============================================================================
function getYearMonthKey() {
    const currentUrl = window.location.href;
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;

    // Megpróbáljuk kinyerni az év/hónap adatot az URL-ből (pl. jelenleti-iv/2026/10)
    const urlParts = currentUrl.split('jelenleti-iv/')[1];

    if (urlParts && urlParts.includes('/')) {
        const parsedYear = Number(urlParts.split('/')[0]);
        const parsedMonth = Number(urlParts.split('/')[1]);

        if (!isNaN(parsedYear) && !isNaN(parsedMonth) && parsedYear > 2000 && parsedMonth >= 1 && parsedMonth <= 12) {
            year = parsedYear;
            month = parsedMonth;
        }
    }

    // Visszaadjuk a dinamikus kulcsnevet (pl. "hourly_rate_2026_10")
    return `hourly_rate_${year}_${month}`;
}

// Dinamikus memóriakulcs meghatározása az aktuális nézethez
const storageKey = getYearMonthKey();

// ============================================================================
// 1. INPUT MEZŐ LÉTREHOZÁSA ÉS HÓNAP-SPECIFIKUS MEMÓRIAKEZELÉS
// ============================================================================

const h4 = document.querySelector('#main')?.querySelectorAll('h4')[0];

if (h4) {
    // A) Konténer (wrapper) létrehozása
    const wrapper = document.createElement('div');
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.border = '1px solid #ccc';
    wrapper.style.borderRadius = '4px';
    wrapper.style.paddingRight = '8px';
    wrapper.style.backgroundColor = '#fff';
    wrapper.style.width = 'fit-content';
    wrapper.style.margin = '5px 0';

    // B) Számbeviteli mező (input) létrehozása
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.placeholder = 'Óradíj';
    input.style.border = 'none';
    input.style.outline = 'none';
    input.style.padding = '5px 8px';
    input.style.width = '100px';

    // C) "Ft" felirat létrehozása
    const suffix = document.createElement('span');
    suffix.innerText = 'Ft';
    suffix.style.color = '#666';
    suffix.style.fontSize = '14px';
    suffix.style.userSelect = 'none';

    // D) Negatív érték letiltása
    input.addEventListener('input', () => {
        if (input.value < 0) {
            input.value = 0;
        }
    });

    // E) Érték kiolvasása az adott hónaphoz tartozó kulcsból (pl. hourly_rate_2026_10)
    chrome.storage.local.get([storageKey], (result) => {
        let hourly_rate = 0;
        
        if (result[storageKey] !== undefined && result[storageKey] !== '') {
            input.value = result[storageKey];
            hourly_rate = Number(result[storageKey]);
        } else {
            input.value = ''; // Ha nincs mentve ehhez a hónaphoz érték, üres marad
        }

        // Elindítjuk a számolást az ehhez a hónaphoz betöltött óradíjjal
        runCalculation(hourly_rate);
    });

    // F) Enter megnyomására az adott hónap kulcsa alá mentünk
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const valueToSave = input.value !== '' ? Number(input.value) : '';

            // Dinamikus kulccsal mentünk (pl. { hourly_rate_2026_10: 2500 })
            chrome.storage.local.set({ [storageKey]: valueToSave }, () => {
                console.log(`Óradíj elmentve (${storageKey}):`, valueToSave);
                input.blur();
                window.location.reload();
            });
        }
    });

    // G) Elemek beszúrása a DOM-ba
    wrapper.appendChild(input);
    wrapper.appendChild(suffix);
    h4.after(wrapper);
}

// ============================================================================
// 2. FŐ VEZÉRLŐ FÜGGVÉNY
// ============================================================================

function runCalculation(hourly_rate) {
    let INPUT = 1;
    let TEXT = 0;

    let currentUrl = window.location.href;
    let ev = new Date().getFullYear();
    let honap = new Date().getMonth() + 1;

    let urlParts = currentUrl.split('jelenleti-iv/')[1];

    if (urlParts == undefined || (urlParts.split('/')[0] == ev && urlParts.split('/')[1] == honap)) {
        counting(INPUT, hourly_rate);
    } else if (urlParts.split('/')[0] < ev || (urlParts.split('/')[0] == ev && urlParts.split('/')[1] < honap)) {
        counting(TEXT, hourly_rate);
    }
}

// ============================================================================
// 3. SZÁMOLÓ ÉS TÁBLÁZAT-MÓDOSÍTÓ FÜGGVÉNY
// ============================================================================

function counting(param, hourly_rate) {
    let trs = document.querySelectorAll('table')[0]?.querySelectorAll('tr');
    if (!trs) return;

    trs[0].innerHTML += '<th>Óraszám2</th>';

    let sum_hour = 0;
    let sum_minute = 0;
    let length = trs.length;

    const today = new Date();
    const hungarianDate = today.toLocaleDateString('hu-HU');

    trs.forEach((tr, index) => {
        if (index === 0 || index === length - 1) return;

        // Mai nap kiemelése
        if (tr.querySelectorAll('td')[0]?.innerText == hungarianDate) { 
            tr.style.backgroundColor = '#BFE3BA';
            tr.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center"
            });
        }

        let from_string = tr.querySelectorAll('td')[1];
        let to_string = tr.querySelectorAll('td')[2];
        let minus_string = tr.querySelectorAll('td')[3];

        if (param == 1) {
            from_string = from_string.querySelector('input')?.value || "";
            to_string = to_string.querySelector('input')?.value || "";
            minus_string = minus_string.querySelector('input')?.value || "";
        } else {
            from_string = from_string.innerText.trim();
            to_string = to_string.innerText.trim();
            minus_string = minus_string.innerText.trim();
        }

        if (from_string == "" || to_string == "") { 
            tr.innerHTML += '<td>0</td>'; 
        } else {
            let from_hour = Number(from_string.split(':')[0]);
            let to_hour = Number(to_string.split(':')[0]);
            let from_minute = Number(from_string.split(':')[1]);
            let to_minute = Number(to_string.split(':')[1]);
            
            let minus_hour = 0;
            let minus_minute = 0;

            if (minus_string != "") {
                minus_hour = Number(minus_string.split(':')[0]);
                minus_minute = Number(minus_string.split(':')[1]);
            }

            let total_from_min = (from_hour * 60) + from_minute;
            let total_to_min = (to_hour * 60) + to_minute;
            let total_minus_min = (minus_hour * 60) + minus_minute;

            let worked_min = total_to_min - total_from_min - total_minus_min;
            if (worked_min < 0) worked_min = 0;

            let result_hour = Math.floor(worked_min / 60);
            let result_minute = worked_min % 60;

            sum_hour += result_hour;
            sum_minute += result_minute;

            let result = result_hour + ":" + (result_minute < 10 ? "0" + result_minute : result_minute);
            tr.innerHTML += '<td>' + result + '</td>';
        }
    });

    sum_hour += Math.floor(sum_minute / 60);
    sum_minute = sum_minute % 60;

    // Összköltség kiszámítása az adott hónap elmentett óradíjával
    const totalHoursFloat = sum_hour + (sum_minute / 60);
    const totalMoney = Math.round(totalHoursFloat * hourly_rate);
    const moneyFormatted = new Intl.NumberFormat('hu-HU').format(totalMoney);

    // Eredmény kiírása a táblázat aljára
    trs[length - 1].innerHTML += '<td>' + sum_hour + ":" + (sum_minute < 10 ? "0" + sum_minute : sum_minute) + ' --> <br>' + moneyFormatted + ' Ft </td>';
}
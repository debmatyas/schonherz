let hourly_rate_before_25 = 2500;
let hourly_rate_after_25 = 2200;

let INPUT = 1;
let TEXT = 0;

let currentUrl = window.location.href;
let ev = new Date().getFullYear();
let honap = new Date().getMonth() + 1;


if (currentUrl.split('jelenleti-iv/')[1] == undefined || currentUrl.split('jelenleti-iv/')[1].split('/')[0] == ev && currentUrl.split('jelenleti-iv/')[1].split('/')[1] == honap) {
    counting(INPUT);

} else if (currentUrl.split('jelenleti-iv/')[1].split('/')[0] < ev ||
    (currentUrl.split('jelenleti-iv/')[1].split('/')[0] == ev &&
        currentUrl.split('jelenleti-iv/')[1].split('/')[1] < honap)) {

    counting(TEXT);
}







function counting(param) {
    let trs = document.querySelectorAll('table')[0].querySelectorAll('tr');
    trs[0].innerHTML += '<th>Óraszám2</th>'

    let sum_hour = sum_minute = 0;

    let length = trs.length;

    const today = new Date();
    const hungarianDate = today.toLocaleDateString('hu-HU');

    trs.forEach((tr, index) => {
        if (index === 0 || index === length - 1) return;
        if (tr.querySelectorAll('td')[0].innerText == hungarianDate) { 
            tr.style.backgroundColor = '#BFE3BA';
            tr.scrollIntoView({
                behavior: "smooth", // Finom, animált görgetés (használhatsz "auto"-t is azonnali ugráshoz)
                block: "center",    // Függőlegesen a képernyő KÖZEPÉRE pozícionálja az elemet
                inline: "center"   // Vízszintesen is középre teszi (ha van vízszintes görgetés)
            });
        }

        let from_string = tr.querySelectorAll('td')[1];
        let to_string = tr.querySelectorAll('td')[2];
        let minus_string = tr.querySelectorAll('td')[3];

        if (param == 1) {
            from_string = from_string.querySelector('input').value;
            to_string = to_string.querySelector('input').value;
            minus_string = minus_string.querySelector('input').value;

        } else {
            from_string = from_string.innerText;
            to_string = to_string.innerText;
            minus_string = minus_string.innerText;
        }

        if (from_string == "" || to_string == "") { tr.innerHTML += '<td>0</td>'; }
        else {
            let from_hour = from_string.split(':')[0];
            let to_hour = to_string.split(':')[0];
            let from_minute = from_string.split(':')[1];
            let to_minute = to_string.split(':')[1];
            let minus_hour = minus_minute = 0;

            if (minus_string != "") {
                minus_hour = minus_string.split(':')[0];
                minus_minute = minus_string.split(':')[1];
            }

            let plus = 0;
            if (to_minute < minus_minute) {
                to_minute = 60 - (minus_minute - to_minute);
                plus = 1;
            } else {
                to_minute = to_minute - minus_minute;
            }

            switch (plus) {
                case 1:
                    to_hour = to_hour - 1 - minus_hour; break;
                default:
                    to_hour = to_hour - minus_hour; break;
            }


            let result_minute;
            let result_hour;
            plus = 0;
            if (to_minute < from_minute) {
                result_minute = 60 - (from_minute - to_minute);
                plus = 1;
            } else {
                result_minute = to_minute - from_minute;
            }
            if (plus == 1) {
                result_hour = to_hour - 1 - from_hour;
            } else {
                result_hour = to_hour - from_hour;
            }
            sum_hour += result_hour;
            sum_minute += result_minute;
            let result;
            if (result_minute < 10) {
                result = "" + result_hour + ":0" + result_minute;
            } else {
                result = "" + result_hour + ":" + result_minute;
            }
            tr.innerHTML += '<td>' + result + '</td>';
        }
    });

    sum_hour += Math.floor(sum_minute / 60);
    sum_minute = sum_minute - (Math.floor(sum_minute / 60) * 60);

    const money = new Intl.NumberFormat('hu-HU').format(sum_hour * hourly_rate_before_25);
    trs[length - 1].innerHTML += '<td>' + sum_hour + ":" + sum_minute + ' --> ' + money + 'Ft </td>';
    document.querySelector('#main').querySelectorAll('h5')[0].innerText += ' -- ' + hourly_rate_before_25 + ' Ft/óra'
}
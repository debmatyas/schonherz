let hourly_rate = 2500;

let currentUrl = window.location.href;

let ev = new Date().getFullYear();
let honap = new Date().getMonth() + 1;


if(currentUrl.split('jelenleti-iv/')[1] == undefined || currentUrl.split('jelenleti-iv/')[1].split('/')[0] == ev && currentUrl.split('jelenleti-iv/')[1].split('/')[1] == honap){
    counting();
}

function counting(){
    document.querySelector('#main').querySelectorAll('h4')[0].innerText += ' -- ' + hourly_rate + ' Ft/óra'
    let trs = document.querySelectorAll('table')[0].querySelectorAll('tr');
    trs[0].innerHTML +=  '<th>Óraszám2</th>'
    let sum_hour = 0;
    let sum_minute = 0;
    let length = trs.length;
    trs.forEach((tr, index) => { 
        if (index === 0 || index === length-1) return;
        let from_string = tr.querySelectorAll('td')[1].querySelector('input').value;
        let to_string = tr.querySelectorAll('td')[2].querySelector('input').value;
        let minus_string = tr.querySelectorAll('td')[3].querySelector('input').value;
        
        if( from_string == "" || to_string == "" ){ tr.innerHTML += '<td>0</td>'; }
        else{
            let from_hour = from_string.split(':')[0];
            let to_hour = to_string.split(':')[0];
            let from_minute = from_string.split(':')[1];
            let to_minute = to_string.split(':')[1];
            let minus_hour = 0;
            let minus_minute = 0;
            if(minus_string != ""){
                minus_hour = minus_string.split(':')[0];
                minus_minute = minus_string.split(':')[1];
            }
            
            let plus = 0;
            if(to_minute < minus_minute){
                to_minute = 60-(minus_minute-to_minute);
                plus = 1;
            }else{
                to_minute = to_minute-minus_minute;
            }

            if(plus == 1){
                to_hour = to_hour-1-minus_hour;
            }else{
                to_hour = to_hour-minus_hour;
            }


            let result_minute;
            let result_hour;
            plus = 0;
            if(to_minute < from_minute){
                result_minute = 60-(from_minute-to_minute);
                plus = 1;
            }else{
                result_minute = to_minute-from_minute;
            }
            if(plus == 1){
                result_hour = to_hour-1-from_hour;
            }else{
                result_hour = to_hour-from_hour;
            }
            sum_hour += result_hour;
            sum_minute += result_minute;
            let result;
            if(result_minute < 10){
                result = "" + result_hour + ":0" + result_minute;
            }else{
                result = "" + result_hour + ":" + result_minute;
            }
            tr.innerHTML += '<td>' + result + '</td>';
        }
    });
    sum_hour += Math.floor(sum_minute/60);
    sum_minute = sum_minute - (Math.floor(sum_minute/60)*60);
    const money = new Intl.NumberFormat('hu-HU').format(sum_hour*hourly_rate);
    trs[length-1].innerHTML += '<td>' + sum_hour + ":" + sum_minute + ' --> ' + money + 'Ft </td>';
}

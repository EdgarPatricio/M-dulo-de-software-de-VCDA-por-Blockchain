function getDateString(date, format){
    var months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    var date = new Date(date);

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var add = (hour == "19" && min == "00" && sec == "00")? 1 : 0;
    var day = date.getDate() + add;
    day = (day < 10 ? "0" : "") + day;
    var out = "";
    switch(format){
        case "DD":
            out = day;
            break;
        case "MM":
            out = months[month-1].toUpperCase().substr(0, 3);
            break;
        case "DD/MM":
            out = day + "/" + month;
            break;
        case "DD MM":
            out = day + " " + months[month-1];
            break;
        case "DD MM YYYY":
            out = day + " de " + months[month-1] + " del " + year;
            break;
        case "DD-MM-YYYY":
            out = day + "-" + month + "-" + year;
            break;
        case "DD/MM/YYYY":
            out = day + "/" + month + "/" + year;
            break;
        case "DD/MM/YYYY HH:MM":
            out = day + "/" + month + "/" + year + " " + hour + ":" + min;
            break;
        case "DD MM YYYY HH:MM":
            out = day + " de " + months[month-1] + " del " + year + " a las " + hour + ":" + min;
            break;
        case "DD MM YYYY HH MM":
            out = day + " de " + months[month-1] + " del " + year + " a las " + hour + " horas " + min + " minutos";
            break;
        case "HH:MM":
            out = hour + ":" + min;
            break;
        default:
            out = format.replace(/DD/g, day);
            out = out.replace(/MM/g, month);
            out = out.replace(/MMMM/g, months[month-1]);
            out = out.replace(/YYYY/g, year);
            out = out.replace(/HH/g, hour);
            out = out.replace(/MIN/g, min);
    }
    return out;
}

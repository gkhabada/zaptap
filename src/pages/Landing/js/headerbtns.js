export class Headerbtns {
    constructor() {
        if (this.getCookie('Authorization')) {
            console.log(this.getCookie('Authorization'));
            let domain = '.zaptap.ru';
            if (location.href.indexOf('dev') !== -1) {
                domain = '.dev' + domain;
            }
            const href = '//lk' + domain;
            document.querySelector('.header__top-right').innerHTML =
                `<button class="popup_link link login" onclick="location.href='${href}';">Войти в Личный Кабинет</button>`;
        }
    }
    getCookie(name) {
        const dc = document.cookie;
        const prefix = name + "=";
        let begin = dc.indexOf("; " + prefix);
        if (begin === -1) {
            begin = dc.indexOf(prefix);
            if (begin !== 0) {
                return null;
            }
        }
        else {
            begin += 2;
            let end = document.cookie.indexOf(";", begin);
            if (end === -1) {
                end = dc.length;
            }
        }
        return decodeURI(dc.substring(begin + prefix.length, end));
    }
}

import Axios from "axios";
import Inputmask from "inputmask";
export class Forms {
    constructor() {
        this.error = async (err) => {
            const resp = err.response;
            const errors = [];
            if (localStorage.getItem('bottom_and_popup_reg') === 'submit__popup')
                window.popup.open("#signup");
            switch (this.getAction()) {
                case 'register':
                    if (resp.status === 400) {
                        errors.push({
                            name: 'email',
                            text: 'Такой e-mail уже используется на сайте.',
                        });
                        localStorage.setItem('bottom_and_popup_reg', 'false');
                    }
                    break;
                case 'login':
                    if (resp.status === 404) {
                        errors.push({
                            name: 'email',
                            text: 'Неверный логин или пароль',
                        });
                    }
                    if (resp.status === 401) {
                        errors.push({
                            name: 'email',
                            text: 'Email не подтвержден',
                        });
                    }
                    break;
            }
            if (errors.length > 0) {
                this.handleErrors(errors);
            }
        };
        this.success = async (res) => {
            switch (this.getAction()) {
                case 'recover':
                    let recoverElement = document.querySelector(this.recover_sended)
                        .querySelector('#recover_email');
                    recoverElement.innerText = this.recover_email;
                    window.popup.open(this.recover_sended);
                    break;
                case 'register':
                    const iframe = document.getElementById('widget');
                    iframe.contentWindow.postMessage({
                        type: 'addRequest',
                        user_id: res.data.user.user_id
                    }, '*');
                    window.popup.open('#register_send');
                    break;
                case 'login':
                    this.login(res.data);
                    break;
            }
        };
        this.formClass = '.form_modal';
        this.remeber = '#remeber';
        this.recover_sended = '#recover_sended';
        this.qA(this.formClass).forEach((form) => {
            this.validateInputsForm(form);
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submit(e.target);
            });
        });
    }
    validateInputsForm(form) {
        form.querySelectorAll('input')
            .forEach(input => {
            const typeEvent = (input.type == 'checkbox') ? 'change' : 'input';
            input.addEventListener(typeEvent, (e) => this.validateInput(e));
        });
    }
    validateInput(event) {
        const { value, checked, name } = event.target;
        let errorMessage;
        switch (name) {
            case 'email':
                errorMessage = this.validateEmail(value);
                break;
            case 'locality':
                errorMessage = this.validateLocality(value);
                break;
            case 'name':
                errorMessage = this.validateName(value);
                break;
            case 'phones':
                errorMessage = this.validatePnone(value);
                break;
            case 'password':
                errorMessage = this.validatePassword(value);
                break;
            case 'agreed':
                if (!checked)
                    errorMessage = "Нужно согласие с условиями Zaptap";
                break;
            case 'locality':
                errorMessage = this.validateLocality(value);
                break;
            case 'phones':
                errorMessage = this.validatePnone(value);
                break;
        }
        let form = event.target.closest('form');
        errorMessage ?
            this.handleError(form, name, errorMessage) :
            form.querySelector('.' + name) ?
                form.querySelector('.' + name).remove() : '';
    }
    handleError(form, className, error) {
        let errorSection = form.querySelector('.' + className);
        if (!!errorSection)
            errorSection.parentNode.removeChild(errorSection);
        const p = document.createElement('p');
        p.classList.add("errmsg");
        p.classList.add(className);
        p.innerText = error;
        form.querySelector('.error-section').append(p);
    }
    q(selector) {
        return document.querySelector(selector);
    }
    qA(selectors) {
        return document.querySelectorAll(selectors);
    }
    pending(status = 1) {
        let action = status ? 'add' : 'remove';
        let button = this.elem.querySelector('[type=submit]');
        button.classList[action]("loading");
        button.disabled = status;
    }
    getAction() {
        return this.elem.dataset.hasOwnProperty('action') ? this.elem.dataset.action : '';
    }
    submit(elem) {
        this.elem = elem;
        this.pending(1);
        let formData = this.serialize();
        if (formData.hasOwnProperty('email'))
            this.recover_email = formData['email'];
        let errors = this.validate(formData);
        // console.log(errors);
        if (errors.length > 0) {
            this.handleErrors(errors);
            this.pending(0);
            return;
        }
        const dev = process.env.PROD_ENV === "development";
        this.host = `https://api.${dev ? "dev." : ""}zaptap.ru`;
        let url, body, selectedRole;
        const { name, password, email, phones, locality } = formData;
        // формируем url относительно формы
        switch (this.getAction()) {
            case 'register':
                url = `${this.host}/user/register`;
                selectedRole = localStorage.getItem('selectedRole');
                body = JSON.stringify({
                    name,
                    password,
                    email,
                    locality,
                    phones,
                    roles: {
                        is_buyer: (selectedRole === 'roleBuyer' || selectedRole === 'roleBoth'),
                        is_seller: (selectedRole === 'roleSeller' || selectedRole === 'roleBoth'),
                    }
                });
                break;
            case 'login':
                url = `${this.host}/user/auth-email`;
                selectedRole = window.selectedRole;
                body = JSON.stringify({
                    email,
                    password
                });
                break;
            case 'set-locality':
                // console.log([this], formData)
                url = `${this.host}/user/register`;
                selectedRole = localStorage.getItem('selectedRole');
                const modal_registr_form = this.serialize(document.querySelector('#modal_registr_form'));
                body = JSON.stringify({
                    name: modal_registr_form['name'],
                    password: modal_registr_form['password'],
                    email: modal_registr_form['email'],
                    phones,
                    locality,
                    roles: {
                        is_buyer: (selectedRole === 'roleBuyer' || selectedRole === 'roleBoth'),
                        is_seller: (selectedRole === 'roleSeller' || selectedRole === 'roleBoth'),
                    }
                });
                break;
            case 'recover':
                url = `${this.host}/user/password-restore`;
                body = JSON.stringify({ email });
                break;
        }
        console.log(localStorage.getItem('bottom_and_popup_reg'));
        let reg_type = localStorage.getItem('bottom_and_popup_reg');
        if (this.getAction() === 'register') {
            switch (reg_type) {
                case 'submit__popup':
                    Axios({
                        url,
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        data: body,
                        responseType: 'json',
                    })
                        .then(this.success)
                        .catch(this.error);
                    break;
                case 'submit__bottom':
                    Axios({
                        url,
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        data: body,
                        responseType: 'json',
                    })
                        .then(this.success)
                        .catch(this.error);
                    break;
                default: {
                    window.popup.open('#choose_role');
                }
            }
        }
        else {
            Axios({
                url,
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: body,
                responseType: 'json',
            })
                .then(this.success)
                .catch(this.error);
        }
        this.pending(0);
    }
    handleErrors(errors) {
        let errorSection = this.elem.querySelector('.error-section');
        if (!!errorSection)
            errorSection.parentNode.removeChild(errorSection);
        const errorDiv = document.createElement('div');
        errorDiv.classList.add("error-section");
        errors.forEach((error) => {
            let p = document.createElement('p');
            p.classList.add("errmsg");
            p.classList.add(error.name);
            p.innerHTML = error.text;
            errorDiv.append(p);
        });
        this.elem.append(errorDiv);
    }
    login(data) {
        // console.log(data);
        const { refresh_token, expires_in, token: tokenData } = data;
        let domain = '.zaptap.ru';
        if (location.href.indexOf('dev') !== -1 || location.href.indexOf('localhost') !== -1) {
            domain = '.dev' + domain;
        }
        let options = {
            path: '/',
            domain,
            expires: expires_in,
        };
        this.setCookie('Authorization', tokenData, options);
        this.setCookie('refresh', refresh_token, options);
        this.setCookie('expires_in', expires_in, options);
        // const iframe = document.getElementById('widget');
        //
        // iframe.contentWindow.postMessage({
        //     type: 'addRequest',
        //     user_id: data.user.user_id
        // }, '*');
        window.location.href = '//lk' + domain;
    }
    setCookie(name, value, options) {
        options = options || {};
        var expires = options.expires;
        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }
        value = encodeURIComponent(value);
        var updatedCookie = name + "=" + value;
        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }
        document.cookie = updatedCookie;
    }
    serialize(elem = this.elem) {
        let form = new FormData(elem);
        let result = {};
        form.forEach((value, name) => {
            result[name] = value;
        });
        return result;
    }
    validate(formData) {
        let result = [];
        let errorMessage;
        for (let name in formData) {
            switch (name) {
                case 'email':
                    if (errorMessage = this.validateEmail(formData[name])) {
                        result.push({
                            name: name,
                            text: errorMessage
                        });
                    }
                    break;
                case 'phones':
                    if (errorMessage = this.validatePnone(formData[name])) {
                        result.push({
                            name: name,
                            text: errorMessage
                        });
                    }
                    break;
                case 'locality':
                    if (errorMessage = this.validateLocality(formData[name])) {
                        result.push({
                            name: name,
                            text: errorMessage
                        });
                    }
                    break;
                case 'name':
                    if (errorMessage = this.validateName(formData[name])) {
                        result.push({
                            name: name,
                            text: errorMessage
                        });
                    }
                    break;
                case 'password':
                    if (errorMessage = this.validatePassword(formData[name])) {
                        result.push({
                            name: name,
                            text: errorMessage
                        });
                    }
                    break;
            }
        }
        let action = this.getAction();
        if (!formData.hasOwnProperty('agreed') && action == 'register') {
            result.push({
                name: 'agreed',
                text: this.validateAgree('')
            });
        }
        if (result.length > 0)
            localStorage.setItem('bottom_and_popup_reg', 'false');
        return result;
    }
    validateAgree(agreed) {
        return !agreed ? "Нужно согласие с условиями Zaptap" : '';
    }
    validatePassword(password) {
        let text = '';
        if (password.length > 32) {
            text = "Слишком длинный пароль";
        }
        if (password.length < 8) {
            text = "Слишком короткий пароль";
        }
        return text;
    }
    validateName(name) {
        return (name.length < 2) ? "Введите свое имя или название компании" : '';
    }
    validateLocality(name) {
        return (name.length < 2) ? "Введите город" : '';
    }
    validateEmail(email) {
        const re = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
        let text = '';
        if (!re.test(email)) {
            text = "Введен некорректный E-mail.";
        }
        if (email.length > 40) {
            text = "Слишком длинный E-mail";
        }
        if (email.length < 5) {
            text = "Слишком короткий E-mail";
        }
        return text;
    }
    validateLocality(name) {
        if (name.length > 0) {
            let firstCharOfCity = name.charAt(0).toUpperCase();
            document.getElementById('registrationLocality').value = firstCharOfCity.concat(name.substring(1, name.length));
        }
        return (name.length < 2) ? "Введите город" : '';
    }
    validatePnone(phones) {
        let phoneInput = document.getElementById("phoneInput");
        var im = new Inputmask("+7(999)999-99-99");
        im.mask(phoneInput);
        const regexp = /\+7\(\d{3}\)\d{3}-\d{2}-\d{2}/g;
        let res = '';
        if (!regexp.test(phones) || phones.length < 5) {
            res = 'Введите свой номер телефона в формате +7(XXX)XXX-XX-XX';
        }
        return res;
    }
}

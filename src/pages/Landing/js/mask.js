export class Mask {
    constructor(element) {
        this.input = element;
        this.defaultValue = this.input.defaultValue;
        this.init();
    }
    init() {
        this.input.addEventListener("input", () => {
            this.input.value = this.inputMask(this.input.value);
        }, false);
    }
    setCursorPosition(pos, elem) {
        elem.focus();
        if (elem.setSelectionRange) {
            elem.setSelectionRange(pos, pos);
        }
        else if (elem.createTextRange) {
            const range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd("character", pos);
            range.moveStart("character", pos);
            range.select();
        }
    }
    inputMask(value) {
        const trimmed = String(value)
            .replace(/\D/gi, '')
            .slice(0, 11)
            .split('');
        if (trimmed[0] === '7') {
            trimmed.shift();
        }
        // tslint:disable-next-line:no-shadowed-variable
        const result = trimmed.reduce((result, num, i) => {
            let post = '';
            if (i === 2) {
                post = ')';
            }
            if (i === 5 || i === 7) {
                post = '-';
            }
            post = i < trimmed.length - 1 ? post : '';
            return result + num + post;
        }, '');
        // tslint:disable-next-line:no-construct
        return new String(result ? '+7(' + result : value.startsWith('+7') ? '+7' : '').slice(0, 18);
    }
}

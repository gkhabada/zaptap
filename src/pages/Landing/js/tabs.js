export class Tabs {
    constructor() {
        // this.links = document.querySelectorAll('.modal_tabs_button');
        this.links = [];
        this.tabs = document.querySelectorAll('.modal_tabs_content_item');
        this.init();
    }
    init() {
        this.links.forEach((it) => {
            it.addEventListener('click', (e) => {
                this.switchActive(e.target);
                this.switchTab(e.target);
            });
        });
    }
    q(selector) {
        return document.querySelector(selector);
    }
    switchActive(elem) {
        this.removeActive();
        elem.classList.add('active');
    }
    switchTab(elem) {
        this.hideTabs();
        let tab = this.q(elem.dataset.tab);
        tab.classList.add('show');
    }
    hideTabs() {
        this.tabs.forEach((it) => it.classList.remove("show"));
    }
    removeActive() {
        this.links.forEach((it) => it.classList.remove("active"));
    }
}

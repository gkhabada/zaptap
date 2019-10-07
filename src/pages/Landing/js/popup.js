export class Popup {
    constructor() {
        this.links = document.querySelectorAll(".popup_link");
        this.closeBtn = ".popup_close";
        this.popupBody = ".popup_body";
        this.overlay_close = ".click_and_hide_popup";
        this.init();
    }
    init() {
        this.links.forEach((it) => {
            it.addEventListener("click", (e) => {
                e.preventDefault();
                this.openPopup(e.target);
            });
        });
    }
    get popup() {
        return document.querySelector('.popup_wrapper');
    }
    close() {
        this.hidePopups();
    }
    open(elem) {
        this.hidePopups();
        const targetElement = document.querySelector(elem);
        targetElement.classList.remove("hidden");
        this.htmlNoscroll();
        targetElement.querySelectorAll(this.closeBtn)
            .forEach(cloaseBtn => cloaseBtn.addEventListener("click", this.closePopup.bind(this)));
        targetElement.querySelector(this.popupBody)
            .addEventListener("click", (e) => e.stopPropagation());
        targetElement.querySelector(this.overlay_close).addEventListener("click", this.closePopup.bind(this));
        // targetElement.addEventListener("click", this.closePopup.bind(this));
    }
    openPopup(target) {
        this.hidePopups();
        let targetElement = document.querySelector(target.dataset.src);
        if (target.dataset.trigger)
            document.querySelector('.trigger_' + target.dataset.trigger).click();
        targetElement.classList.remove("hidden");
        this.htmlNoscroll();
        targetElement.querySelectorAll(this.closeBtn)
            .forEach(cloaseBtn => cloaseBtn.addEventListener("click", this.closePopup.bind(this)));
        targetElement.querySelector(this.popupBody)
            .addEventListener("click", (e) => e.stopPropagation());
        targetElement.querySelector(this.overlay_close).addEventListener("click", this.closePopup.bind(this));
        // targetElement.addEventListener("click", this.closePopup.bind(this));
    }
    closePopup() {
        this.hidePopups();
        this.htmlNoscroll('remove');
    }
    hidePopups() {
        let popups = document.querySelectorAll('.popup_wrapper');
        popups.forEach((popup) => {
            popup.classList.add('hidden');
            popup.removeEventListener("click", this.closePopup);
        });
    }
    htmlNoscroll(action = 'add') {
        document.documentElement.classList[action]("noscroll");
    }
}
  

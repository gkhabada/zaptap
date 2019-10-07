import Glide from "@glidejs/glide";
export class Slider {
    constructor() {
        this.buttons = document.querySelectorAll(".button__slider");
        this.container = document.querySelector(".myslider");
        this.glide = document.querySelector(".glide");
        this.buttons.forEach(button => {
            button.addEventListener("click", () => {
                this.container.classList.remove("hidden");
                new Glide(".glide").mount();
                this.container.addEventListener("click", this.documentClick.bind(this));
            });
        });
    }
    bindEvent() {
        this.button.addEventListener("click", () => {
            this.container.classList.remove("hidden");
            new Glide(".glide").mount();
            this.container.addEventListener("click", this.documentClick.bind(this));
        });
    }
    documentClick(e) {
        const target = e.target;
        if (!this.glide.contains(target) ||
            target.classList.contains("close__slider__button")) {
            this.container.classList.add("hidden");
            document.removeEventListener("click", this.documentClick);
        }
    }
}

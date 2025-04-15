
function addTarget(i, type) {
    if (!vm.$refs.childitemclick.isAddTarget)
        return;

    const chaleshForItemEl = document.querySelector(`.targetForItem.el${i}`);
    if (chaleshForItemEl)
        return;

    const selector = `.itemMain${i}`;
    const itemMain = document.querySelector(selector);
    const rectEl = itemMain.getBoundingClientRect();
    const divEl = document.createElement('div');

    let c = `targetForItem el${i}`;

    c += i > 6 ? ' target2' : ' target1';
    c += type == 0 ? ' targetColor1' : ' targetColor2';

    divEl.className = c;
    divEl.style.left = `${rectEl.left - 25}px`;
    divEl.style.top = `${rectEl.top + 10}px`;
    mainTemplate.appendChild(divEl);
    setTimeout(() => {
        divEl.remove()
    },
        1400);
}

itemclick.Component = function (app) {
    app.component('itemclick-component', {
        template: '#itemclick-template',
        data() {
            return {
                itemIndex:-1,
                modal:false,
                isAddTarget: true,
            }
        },
        props: {
        },
        methods: {
            click(i) {
                this.itemIndex = i;
                this.modal = true;
            },
            target(type) {
                addTarget(this.itemIndex, type)
            }
        }
    });
}
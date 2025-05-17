
const Mafia_COMMENT0 = `
<p>بازی رنگ و راز 5 نفر بازی شرکت کننده دارد</p><p>نقش‌ها: 2 نقاش، 1 بازپرس، 1 استاد، و 1 جاسوس</p><p>شما باید تلاش کنید بوسیله طراحی و گفتگو جاسوس را بیابید</p>
<hr>
<p>استاد موضوع نقاشی را انتخاب کرده و به همه (به‌جز جاسوس) اعلام می‌کند</p><p>جاسوس از طراحی‌ها تلاش می‌کند موضوع را حدس بزند و طرح خودش را بکشد.</p><p>شرکت‌کنندگان از طرح خود و ارتباط آن با موضوع دفاع می‌کنند</p><p>در زمان دفاع, موضوع برای جاسوس مشخص میشود</p>
<hr><p>این بازی در 1 دور آشنایی, 1 دور طراحی و نهایتا 3 دور دفاع برگزار میشود</p>`;


const HELP_Mafia_COMMENT ={
        "type": '0',
        "title": 'راهنما',
        "icon": 'icon-information4',
        "comment": Mafia_COMMENT0
    }

let isShowCard = false;

function showCard() {
    if (isShowCard) return;
    isShowCard = true;
    vm.$refs.childhelp.isShowCard = true;

    const el = document.querySelector(`.naghshCard`);
    el.top = `50%`;
    setTimeout(() => {
        const animation = el.animate([
            { top: `50%`, transform: "translate(-50%, -50%) scale(1)" },
            { top: `14px`, transform: "translate(-50%, -50%) scale(0.1)" }
        ], {
            duration: 400,
            easing: 'ease-in-out',
        });

        animation.onfinish = () => {
            vm.$refs.childhelp.isShowCard = false;
        };
    }, 5000)
}
help.find = function (type) {
    let group = {
        icon: 'icon-users',
        title: 'گروه آبی',
        color: '#30ccff',
    };
    if (type > 20) {
        group.title = 'گروه قرمز';
        group.color = '#f35a9f';
    }
    else if (type > 10) {
        group.title = 'گروه سبز';
        group.color = '#82f35a';
    }
    return group;
}
help.usersReceive = function (type) {

    const helpItem = help.find(type);
    vm.$refs.childhelp.selectItem = HELP_Mafia_COMMENT;
    vm.$refs.childhelp.myItem = helpItem;
    showCard()
    return helpItem;
}

help.Component = function (app) {
    app.component('help-component', {
        template: '#help-template',
        data() {
            return {
                myItem: {},
                selectItem: {},
                isShowCard: true,
            }
        },
        props: {
            appModel: {
                type: Object,
                required: true,
                default: () => ({})
            },
        },
        created() {
        },
        methods: {
            init() {
            },
         }
    });
}
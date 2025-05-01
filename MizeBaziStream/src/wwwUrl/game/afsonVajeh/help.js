
const RANGORAZ_COMMENT0 = `
<p>بازی رنگ و راز 5 نفر بازی شرکت کننده دارد</p><p>نقش‌ها: 2 نقاش، 1 بازپرس، 1 استاد، و 1 جاسوس</p><p>شما باید تلاش کنید بوسیله طراحی و گفتگو جاسوس را بیابید</p>
<hr>
<p>استاد موضوع نقاشی را انتخاب کرده و به همه (به‌جز جاسوس) اعلام می‌کند</p><p>جاسوس از طراحی‌ها تلاش می‌کند موضوع را حدس بزند و طرح خودش را بکشد.</p><p>شرکت‌کنندگان از طرح خود و ارتباط آن با موضوع دفاع می‌کنند</p><p>در زمان دفاع, موضوع برای جاسوس مشخص میشود</p>
<hr><p>این بازی در 1 دور آشنایی, 1 دور طراحی و نهایتا 3 دور دفاع برگزار میشود</p>`;

const RANGORAZ_COMMENT1 = ` <p>نقش بازپرس برای همه بوسیله نماد <i class="icon-star4" style="color: var(--NaghshSefidColor);"></i> مشخص است</p>
<p>نقش استاد به بازپرس اعلام میشود</p>
<p>بازپرس از بین موضوهای اعلامی یک موضوع را برای نقاشی انتخاب میکند<p>
<p>بازپرس میتواند در هر دور 2 نفر را برای رایگیری انتخاب کند </p>`;

const RANGORAZ_COMMENT2 = `<p>نقش استاد برای بازپرس مشخص است<p>
<p>استاد با رای گیری از بازی خارج نمیشود و تنها نقش او برای دیگر اعضا افشا میشود</p>
<p>استاد میتواند هر زمانی که خواست نقش خود را افشا کند. در صورت افشای نقش استاد, دیگر بازکنان <span style="color:#ff4e4e">حق حدس نقش</span> را ندارند</p>
<p>نقش استاد پس از افشا بوسیله نماد <i class="icon-medal4" style="color: var(--NaghshSefidColor);"></i> اعلام میشود</p>`;

const RANGORAZ_COMMENT3 = `<p>نقاش موضوع اعلامی از طرف استاد را طراحی میکند</p>
<p>در صورت خروج نقاش از بازی بوسیله رای‌گیری, در صورت حدس درست نقش جاسوس تیم نقاش‌ها برنده بازی هستند</p>`;

const RANGORAZ_COMMENT4 = `
<p>موضوع نقاشی تنها در دور دفاع از طرح برای جاسوس مشخص میشود.</p>
<p>در صورت خروج جاسوس از بازی بوسله رای‌گیری, در صورت حدس درست نقش استاد , جاسوس برنده بازی خواهد بود</p>`;

const HELP_RANGORAZ_COMMENT = [

    {
        "type": '0',
        "title": 'راهنما',
        "icon": 'icon-information4',
        color: '#7499ac',
        "comment": RANGORAZ_COMMENT0
    },
    {
        "type": 'blue',
        "title": 'گروه آبی',
        "icon": 'icon-group',
        color: '#30ccff',
        "comment": RANGORAZ_COMMENT1
    },
    {
        "type": 'red',
        "title": 'گروه قرمز',
        "icon": 'icon-group',
        color: '#f35a9f',
        "comment": RANGORAZ_COMMENT2
    },
    {
        "type": 'neutral',
        "title": 'بی‌طرف‌ها',
        "icon": 'icon-users',
        color: '#82f35a',
        "comment": RANGORAZ_COMMENT3
    }
]

let isShowCard = false;

help.find = function (type) {
    let t = 21;
    if (type < 20)
        t = 11
    if (type < 10)
        t = 1;
    return HELP_RANGORAZ_COMMENT.find(h => h.type == t);
}
help.usersReceive = function (type) {
    const helpItem = HELP_RANGORAZ_COMMENT.find(h => h.type == globalModel.groupItem.type);
    vm.$refs.childhelp.selectItem = helpItem;
    vm.$refs.childhelp.selectType = helpItem.type;
    const naghsh = {
        icon: helpItem.icon,
        color: helpItem.color
    }

    if (globalModel.groupItem.type == 'blue') 
        naghsh.title = type == 1 ? 'سر گروه آبی' : 'عضو گروه آبی';
    else if (globalModel.groupItem.type == 'red')
        naghsh.title = type == 11 ? 'سر گروه قرمز' : 'عضو گروه قرمز';
    else
        naghsh.title = 'بی‌طرف';

    vm.$refs.childhelp.myItem = naghsh;
    vm.$refs.childhelp.myItem.secret = globalModel.groupItem.secret;
    return naghsh;
}

help.Component = function (app) {
    app.component('help-component', {
        template: '#help-template',
        data() {
            return {
                helpComment: HELP_RANGORAZ_COMMENT,
                myItem: {},
                selectItem: {},
                selectType: 0,
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
            changeSelectType(item) {
                this.selectItem = item;
                this.selectType = item.type
            }
        }
    });
}
var urlJoin = '/api/v1/Group/Join';
var urlSearch = '/api/v1/Group/Search';
var urlGetMyGroup = '/api/v1/Group/GetMyGroup';
var urlList = '/api/v1/Group/List';
var urlAdd = '/api/v1/Group/Add';

async function searchInit(obj) {
    if (vm.$refs.childsearch.loding)
        return;

    if (obj.name.isNullOrEmpty() || obj.name.length < 3) {
        pushErrorMessage({ comment: 'حدعقل 3 حرف باید وارد کنید' });
        return
    }
    vm.$refs.childsearch.loding = true;
    var url = `${urlSearch}?name=${obj.name}`;

    appHttp(url)
        .then((data) => {
            data.map((item) => {
                item.pDate = item.date.toJalaaliString();
                item.type = item.password == 'false' ? "عمومی " : 'خصوصی';
            });
            obj.list = data
        }).finally(()=>vm.$refs.childsearch.loding = false);
}

async function join(obj) {
    if (obj.loding)
        return;
    obj.loding = true;

    appHttp(urlJoin, {
        id: obj.item.id,
        password: obj.password
    }).then((data) => {
        return appHttp(urlList);
    }).then((data) => {
        data.map((item) => {
            item.pDate = item.date.toJalaaliString();
        });
        vm.mainModel.list = data;
        vm.appModel.state = 'myGroup';
        pushSuccessMessage({ comment: `عضو این گروه شدید` })
    }).finally(() =>obj.loding = false);
}

async function myGroupInit(obj) {
    if (obj.loding)
        return;
    obj.loding = true;

    appHttp(urlGetMyGroup).then((data) => {
        if (data) {
            data.isCreate = true;
            data.pDate = data.date.toJalaaliString();
        }
        obj.itemMyGroup = data || {};
    }).then(() => {
        return appHttp(urlList);
    }).then((data) => {
        data.map((item) => {
            item.pDate = item.date.toJalaaliString();
        });
        obj.list = data;
    }).finally(() => obj.loding = false);
}

async function create(mainModel) {
    if (mainModel.loding)
        return;
    mainModel.loding = true;

    appHttp(urlAdd, mainModel.itemCreate).then((data) => {
        return appHttp(urlGetMyGroup);
    }).then((data) => {
        vm.appModel.state = 'myGroup';
        if (data) {
            data.isCreate = true;
            data.pDate = data.date.toJalaaliString();
        }
        mainModel.itemMyGroup = data || {};
    }).finally(() => mainModel.loding = false);
}

const app = Vue.createApp({

    data() {
        return {
            appModel: {
                state: '_state',
            },
            mainModel: {
                loding: false,
                list: [],
                itemCreate: {
                    uniqueName: "",
                    name: "",
                    password: "",
                    description: ""
                },
                itemMyGroup: {},
            },
            searchModel: {
                name: 'str',
                list: []
            }
        }
    },
    created() {
        this.appModel.state = 'myGroup';
        myGroupInit(this.mainModel);
    },
    methods: {
        changeState(state) {
            this.appModel.state = state
        }
    }
})

app.component('group-component', {
    template: '#group-template',
    data() {
        return {
            item: {},
        }
    },
    props: {
        appModel: {
            type: Object,
            required: true,
            default: () => ({})
        },
        mainModel: {
            type: Object,
            default: () => ({})
        }
    },
    methods: {
        limitText(event,limit) {
            const textLength = event.target.value.length;
            if (textLength >= limit) {
                event.target.value = event.target.value.substring(0, limit -1);
                this.text = event.target.value;
            }
        },
        createGroup() {
            create(this.mainModel)
        },
        init() {
            this.modalForJoin = false;
            join(this.$data)
        }
    }
});
app.component('search-component', {
    template: '#search-template',
    data() {
        return {
            loding: false,
            name: '',
            password: '',
            modalForJoin: false,
            item: {},
        }
    },
    props: {
        appModel: {
            type: Object,
            default: () => ({})
        },
        searchModel: {
            type: Object,
            default: () => ({})
        }
    },
    methods: {
        searchInit() {
            this.name = this.searchModel.name;
            this.list= [];
            searchInit(this.searchModel)
        },
        joinModal(item) {
            this.password = '';
            this.item = item;
            this.modalForJoin= true;
        },
        join() {
            this.modalForJoin = false;
            join(this.$data) 
        }
    }
});

const vm = app.mount('#app');


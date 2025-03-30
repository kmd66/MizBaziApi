let vm;
var connection;
var key;
var userId;
var roomId;

var urlListRequest = '/api/v1/Friend/ListRequest';
var urlList = '/api/v1/Friend/List';
var urlListBlock = '/api/v1/Friend/ListBlock';
var urlRequestEdit = '/api/v1/Friend/RequestEdit';
var urlRemoveBlock = '/api/v1/Friend/RemoveBlock?userId=';
var urlRemoveFriend = '/api/v1/Friend/RemoveFriend?userId=';
var urlBlock = '/api/v1/Friend/Block?userId=';

var urlMessageList = '/api/v1/Message/List';
var urlMessageListForRoom = '/api/v1/Message/ListForRoom';
var urlMessageAdd= '/api/v1/Message/Add';
var urlMessageRemove = '/api/v1/Message/Remove';

function initSoket() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/friendhub")
        .withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol())
        .build();

    connection.on("InitReceive", (k,i) => {
        key = k;
        userId = i;
        let params = new URLSearchParams(document.location.search);
        let state = params.get("state");
        if (!state)
            state = 'message';
        vm.changeState(state);
    });

    soketStart(connection, callbackSoketStart);
    function callbackSoketStart() {
        connection.invoke("Init", publicToken, publicDeviceId);
    }

}

const app = Vue.createApp({

    data() {
        return {
            appModel: {
                state: '_state',
                title: '',
                startInit: false,
                loding: false 
            },
        }
    },
    created() {
    },
    methods: {
        changeState(state) {
            switch (state) {
                case 'request':
                    vm.$refs.childrequest.init(); break;
                case 'message':
                    vm.$refs.childmessage.init(); break;
                case 'chat':
                    vm.$refs.childchat.init(); break;
                case 'friend':
                    vm.$refs.childfriend.init(); break;
                case 'block':
                    vm.$refs.childblock.init(); break;
            }
            this.appModel.state = state
        }
    }
})

app.component('chat-component', {
    template: '#chat-template',
    data() {
        return {
            startInit: false
        }
    },
    props: {
        appModel: {
            type: Object,
            required: true,
            default: () => ({})
        },
    },
    methods: {
        init() {
            this.appModel.title = 'پیام';
        }
    }
});

app.component('message-component', {
    template: '#message-template',
    data() {
        return {
            list: []
        }
    },
    props: {
        appModel: {
            type: Object,
            required: true,
            default: () => ({})
        },
    },
    methods: {
        init() {
            this.appModel.title = 'پیام';
            if (!this.appModel.startInit) {
                this.appModel.startInit = true;
                this.listMessage();
            }
        },
        listMessage() {
            this.appModel.loding = true
            appHttp(urlMessageList).then((data) => {
                data.map((item) => {
                    item.text2 = item.text;
                    if (item.text2.length > 30)
                        item.text2 = item.text2.substring(2, 30) + '...'
                    item.pTime = item.lastDate.getTime();
                    item.pDate = item.lastDate.toJalaaliString();
                });
                this.list = data
            }).finally(() => this.appModel.loding = false);
        }
    }
});

app.component('request-component', {
    template: '#request-template',
    data() {
        return {
            modal: {
                type: 0,// add remove block 
                item: {},
            },
            startInit: false,
            searchModel: {},
            list: []
        }
    },
    props: {
        appModel: {
            type: Object,
            required: true,
            default: () => ({})
        },
    },
    methods: {
        init() {
            this.appModel.title = 'درخواست‌های دوستی';
            if (!this.startInit) {
                this.startInit = true;
                this.search();
            }
        },
        search() {
            this.appModel.loding = true
            appHttp(urlListRequest, this.searchModel).then((data) => {
                data.map((item) => {
                    item.pDate = item.date.toJalaaliString();
                });
                this.list = data
            }).finally(() => this.appModel.loding = false);
        },
        okModal() {
            this.appModel.loding = true;
            var model = {
                type: this.modal.type,
                userId: this.modal.item.userId
            }
            this.resetModal(this.modal)
            appHttp(urlRequestEdit, model).then((data) => {
                var removeIndex = this.list.map(x => x.userId).indexOf(model.userId);
                this.list.splice(removeIndex, 1);
            }).finally(() => this.appModel.loding = false);
        }
    }
});

app.component('friend-component', {
    template: '#friend-template',
    data() {
        return {
            modal: {
                type: 0,// add remove block 
                item: {},
            },
            startInit: false,
            searchModel: {},
            list: []
        }
    },
    props: {
        appModel: {
            type: Object,
            required: true,
            default: () => ({})
        },
    },
    methods: {
        init() {
            this.appModel.title = 'دوستان';
            if (!this.startInit) {
                this.startInit = true;
                this.search();
            }
        },
        search() {
            this.appModel.loding = true
            appHttp(urlList, this.searchModel).then((data) => {
                data.map((item) => {
                    item.pDate = item.date.toJalaaliString();
                });
                this.list = data
            }).finally(() => this.appModel.loding = false);
        },
        okModal() {
            this.appModel.loding = true;
            let url;
            if (this.modal.type == 3)
                url = urlBlock + this.modal.item.userId;
            else
                url = urlRemoveFriend + this.modal.item.userId;
            appHttp(url).then((data) => {
                var removeIndex = this.list.map(x => x.userId).indexOf(this.modal.item.userId);
                this.list.splice(removeIndex, 1);
            }).finally(() => {
                this.resetModal(this.modal);
                this.appModel.loding = false;
            });
        }
    }
});

app.component('block-component', {
    template: '#block-template',
    data() {
        return {
            modal: {
                type: 0,// add remove block 
                item: {},
            },
            startInit: false,
            searchModel: {},
            list: []
        }
    },
    props: {
        appModel: {
            type: Object,
            required: true,
            default: () => ({})
        },
    },
    methods: {
        init() {
            this.appModel.title = 'مسدود شده‌ها'; 
            if (!this.startInit) {
                this.startInit = true;
                this.search();
            }
        },
        search() {
            this.appModel.loding = true
            appHttp(urlListBlock, this.searchModel).then((data) => {
                data.map((item) => {
                    item.pDate = item.date.toJalaaliString();
                });
                this.list = data
            }).finally(() => this.appModel.loding = false);
        },
        okModal() {
            this.appModel.loding = true;
            var url = urlRemoveBlock + this.modal.item.userId;
            appHttp(url).then((data) => {
                var removeIndex = this.list.map(x => x.userId).indexOf(this.modal.item.userId);
                this.list.splice(removeIndex, 1);
            }).finally(() => {
                this.resetModal(this.modal);
                this.appModel.loding = false;
            });
           
        }
    }
});

app.config.globalProperties.limitText = function (event, limit) {
    const textLength = event.target.value.length;
    if (textLength >= limit) {
        event.target.value = event.target.value.substring(0, limit - 1);
        this.text = event.target.value;
    }
};
app.config.globalProperties.resetModal = function (modal) {
    modal.type = 0;
    modal.item = {};
};

vm = app.mount('#app');
initSoket();


let vm;
var connection;
var key;

var urlJoin = '/api/v1/Group/Join';

function initSoket() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/friendhub")
        .withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol())
        .build();

    connection.on("InitReceive", (k) => {
        key = k;
    });

    soketStart(connection, callbackSoketStart);
    function callbackSoketStart() {
        connection.invoke("Init", publicToken, publicDeviceId);
        vm = app.mount('#app');
    }

}

const app = Vue.createApp({

    data() {
        return {
            appModel: {
                state: '_state',
                title: '',
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

app.component('request-component', {
    template: '#request-template',
    data() {
        return {
            sirsetInit: false
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
        }
    }
});

app.component('message-component', {
    template: '#message-template',
    data() {
        return {
            sirsetInit: false
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

app.component('chat-component', {
    template: '#chat-template',
    data() {
        return {
            sirsetInit: false
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

app.component('friend-component', {
    template: '#friend-template',
    data() {
        return {
            sirsetInit: false
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
        }
    }
});

app.component('block-component', {
    template: '#block-template',
    data() {
        return {
            sirsetInit: false
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

initSoket();


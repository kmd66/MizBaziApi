let vm;
var connection;
var key;

var joinItem;

var urlJoin = '/api/v1/Group/Join';
var urlSearch = '/api/v1/Group/Search';
var urlGetMyGroup = '/api/v1/Group/GetMyGroup';
var urlList = '/api/v1/Group/List';
var urlAdd = '/api/v1/Group/Add';
var urlEdit = '/api/v1/Group/Edit';

function initSoket() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/grouphub")
        .withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol())
        .build();

    connection.on("InitReceive", (k) => {
        key = k;
        connection.invoke("GetGroups", key);
    });

    connection.on("GetGroupsReceive", (b) => {
        if (b && !vm) {
            vm = app.mount('#app');
            inputs();
        }
    });

    connection.on("JoinReceive", (texts, pinText) => {
        var objTexts = JSON.parse(texts);
        objTexts.map((item) => {
            item.pDate = item.Date.toJalaaliString() + ' ' + item.Date.getTime();
        });
        vm.mainModel.loding = false;
        vm.$refs.childchat.pinText = pinText;
        vm.$refs.childchat.texts = objTexts;
        vm.$refs.childchat.joinItem = joinItem;
        vm.appModel.state = 'chatGroup';
            scrollEl('#chatList',true);
    });

    connection.on("ExitReceive", (b) => {
        if (b) {
            childchatRestart();
            vm.appModel.state = 'myGroup';
        }
    });

    connection.on("MessageReceive", (t) => {
        var item = JSON.parse(t);
        item.pDate = item.Date.toJalaaliString() + ' ' + item.Date.getTime();
        vm.$refs.childchat.texts.push(item);
            scrollEl('#chatList');
    });

    connection.on("MessagePinReceive", (t) => {
        vm.$refs.childchat.pinText = t;
        pushSuccessMessage({ comment: 'متن سنجاق شده تغییر کرد' });
    });

    connection.on("DestroyReceive", (t) => {
        vm.appModel.state = 'myGroup';
        childchatRestart();
        myGroupInit(vm.mainModel);
    });

    connection.on("ListUserFromGroupReceive", (b, json) => {
        vm.$refs.childchat.loding = false;
        var obj = JSON.parse(json);
        obj.map((item) => {
            item.pDate = item.Date.toJalaaliString();
        });
        if (b)
            vm.$refs.childchat.listBlockUser = obj;
        else
            vm.$refs.childchat.listUser = obj;
    });

    connection.on("RemoveFromGroupReceive", (b, userId) => {
        vm.$refs.childchat.loding = false;
        if (b) {
            if (vm.$refs.childchat.listUser.length && vm.$refs.childchat.listUser.length > 0) {
                var removeIndex = vm.$refs.childchat.listUser.map(item => item.UserId).indexOf(userId);
                if (removeIndex > -1)
                vm.$refs.childchat.listUser.splice(removeIndex, 1);
            }
            if (vm.$refs.childchat.listBlockUser.length && vm.$refs.childchat.listBlockUser.length > 0) {
                var removeIndex = vm.$refs.childchat.listBlockUser.map(item => item.UserId).indexOf(userId);
                if (removeIndex > -1)
                    vm.$refs.childchat.listBlockUser.splice(removeIndex, 1);
            }
        }
    });

    connection.on("AddBlockReceive", (b, userId) => {
        vm.$refs.childchat.loding = false;
        if (b) {
            if (vm.$refs.childchat.listUser.length && vm.$refs.childchat.listUser.length > 0) {
                var removeIndex = vm.$refs.childchat.listUser.map(item => item.UserId).indexOf(userId);
                var item = vm.$refs.childchat.listUser.splice(removeIndex, 1);
                if (item.length > 0) 
                vm.$refs.childchat.listBlockUser.push(item[0])
            }
        }
    });

    connection.on("targetRemoveReceive", (k, n) => {
        pushErrorMessage({ comment: `شما از گروه ${n} اخراج شدید.` });
        vm.mainModel.list
        vm.appModel.state = 'myGroup';
        var removeIndex = vm.mainModel.list.map(x => x.Id).indexOf(k);
        vm.mainModel.list.splice(removeIndex, 1);
    });

    soketStart(connection, callbackSoketStart);
    function callbackSoketStart() {
        connection.invoke("Init", publicToken, publicDeviceId);
    }

    function childchatRestart() {
        vm.$refs.childchat.modalForRemove = false;
        vm.$refs.childchat.pinText = null;
        vm.$refs.childchat.texts = [];
        vm.$refs.childchat.joinItem = {};
        vm.$refs.childchat.listUser = [];
        vm.$refs.childchat.listBlockUser = [];
    }
}
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
        }).finally(() => vm.$refs.childsearch.loding = false);
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
        connection.invoke("GetGroups", key);
        data.map((item) => {
            if (vm.mainModel.itemMyGroup && vm.mainModel.itemMyGroup.createId == item.createId)
                item.isCreate = true;
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
            if (vm.mainModel.itemMyGroup && vm.mainModel.itemMyGroup.createId == item.createId)
                item.isCreate = true;
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
        connection.invoke("GetGroups", key);
    }).finally(() => mainModel.loding = false);
}

async function edite(obj) {
    if (obj.loding)
        return;
    obj.loding = true;

    appHttp(urlEdit, obj.itemEdite).then((data) => {
        obj.chatState = 'main';
        obj.edite = false;
        obj.joinItem.name = obj.itemEdite.name;
        obj.joinItem.description = obj.itemEdite.description;
        obj.joinItem.password = obj.itemEdite.password;
        obj.itemEdite = {};
        pushSuccessMessage({ comment: 'ویرایش انوجام شد' });
    }).finally(() => obj.loding = false);
}

async function joinToGroup(mainModel) {
    if (mainModel.loding)
        return;
    mainModel.loding = true;
    connection.invoke("Join", key, joinItem.id);
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
                itemCreate: {},
                itemMyGroup: {},
            },
            searchModel: {
                name: '',
                list: []
            },
            chatModel: {
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
            joinToGroupItem: {},
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
        createGroup() {
            create(this.mainModel)
        },
        joinToGroup(item) {
            joinItem = item;
            joinToGroup(this.mainModel)
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

app.component('chat-component', {
    template: '#chat-template',
    data() {
        return {
            chatState: 'main', // main edit user
            loding: false,
            pinPreLine: false,
            edite: false,
            modalForRemove: false,
            message: '',
            joinItem: {},
            itemEdite: {},
            pinText: '',
            pinTextEdite: '',
            texts: [],
            listUser: [],
            listBlockUser: [],
            userInit: false,
            userBlockInit: false,
            searchUserName: '',
            searchName: ''
        }
    },
    props: {
        appModel: {
            type: Object,
            default: () => ({})
        },
        chatModel: {
            type: Object,
            default: () => ({})
        }
    },
    methods: {
        exitFromGroup() {
            connection.invoke("Exit", key);
            this.itemEdite = {};
            this.chatState = 'main';
            this.edite = false;
        },
        editeGroup() {
            edite(this.$data);
        },
        removeGroup() {
            connection.invoke("Destroy", key);
        },
        leftGroup() {
            connection.invoke("Left", key);
        },
        sendMessage() {
            if (this.message.isNullOrEmpty())
                return
            connection.invoke("Message", key, this.message);
            this.message = '';
        },
        sendPinMessage() {
            if (this.pinTextEdite.isNullOrEmpty())
                return;
            this.chatState = 'main';
            this.edite = false;
            connection.invoke("MessagePin", key, this.pinTextEdite);
        },
        listInit() {
            this.chatState = 'user';
            if (!this.userInit) {
                this.userInit = true;
                connection.invoke("ListUserFromGroup", key, false, null, null);
            }
        },
        list() {
            this.loding = true;
            var blocked = false;
            if (this.chatState == 'userBlock')
                var blocked = true;
            if (this.searchUserName == '')
                this.searchUserName = null;
            if (this.searchName == '')
                this.searchName = null;
            connection.invoke("ListUserFromGroup", key, blocked, this.searchUserName, this.searchName);
        },
        removeFromGroup(item) {
            this.loding = true;
            connection.invoke("RemoveFromGroup", key, item.UserId);
        },
        addBlock(item) {
            this.loding = true;
            connection.invoke("AddBlock", key, item.UserId);
        },
        changeState(s) {
            if (!this.userBlockInit && s == 'userBlock') {
                this.userBlockInit = true;
                connection.invoke("ListUserFromGroup", key, true, null, null);
            }
            this.chatState = s;
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


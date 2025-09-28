let vm;
var connection;
var key;
var userId;
var roomId;

const urlListRequest = `${publicApiBaseUrl}/api/v1/Friend/ListRequest`;
const urlList = `${publicApiBaseUrl}/api/v1/Friend/List`;
const urlListBlock = `${publicApiBaseUrl}/api/v1/Friend/ListBlock`;
const urlRequestEdit = `${publicApiBaseUrl}/api/v1/Friend/RequestEdit`;
const urlRemoveBlock = `${publicApiBaseUrl}/api/v1/Friend/RemoveBlock?userId=`;
const urlRemoveFriend = `${publicApiBaseUrl}/api/v1/Friend/RemoveFriend?userId=`;
const urlBlock = `${publicApiBaseUrl}/api/v1/Friend/Block?userId=`;

const urlMessageList = `${publicApiBaseUrl}/api/v1/Message/List`;
const urlMessageListForRoom = `${publicApiBaseUrl}/api/v1/Message/ListForRoom?userId=`;
const urlMessageAdd = `${publicApiBaseUrl}/api/v1/Message/Add`;
const urlMessageRemove = `${publicApiBaseUrl}/api/v1/Message/Remove`;

function initSoket() {
    console.log(`--------public Hub BaseUrl- ${publicHubBaseUrl}`)
    connection = new signalR.HubConnectionBuilder()
        .withUrl(`${publicHubBaseUrl}/friendhub`, {
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets,
            withCredentials: false
        })
        .withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol())
        .build();

    connection.on("InitReceive", (k, i) => {
        key = k;
        userId = i;
        let params = new URLSearchParams(document.location.search);
        let state = params.get("state");
        if (!state)
            state = 'message';
        vm.changeState(state);
    });

    connection.on("InitMessageReceive", (json) => {
        if (json) {
            var obj = JSON.parse(json);
            vm.$refs.childchat.listUser.push(obj);
            vm.$refs.childchat.getUser();
        }
    });

    connection.on("AddMessageReceive", (mes, json, i) => {
        if (mes && !mes.isNullOrEmpty()) {
            pushErrorMessage(mes);
            return
        }
        var obj = JSON.parse(json);
        vm.$refs.childchat.setMessage(obj, i);
    });

    connection.on("TargetMessageReceive", (friendData, msgJson) => {

        var objMsg = JSON.parse(msgJson);

        if (!friendData.isNullOrEmpty()) {
            var objFriend = JSON.parse(friendData);
            vm.$refs.childchat.listUser.push(objFriend);
        }
        let userIndex = vm.$refs.childchat.listUser.map(x => x.Id).indexOf(objMsg.SenderID);
        if (userIndex > -1)
            vm.$refs.childmessage.setTargetMessage(friendData, {
                userName: vm.$refs.childchat.listUser[userIndex].UserName,
                Text: objMsg.Text,
                Date: objMsg.Date
            });

        vm.$refs.childchat.setTargetMessage(objMsg);

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
        this.startInit = true;
    },
    methods: {
        changeState(state) {
            switch (state) {
                //case 'chat':
                //    vm.$refs.childchat.init(userName); break;
                case 'message':
                    vm.$refs.childmessage.init(); break;
                case 'request':
                    vm.$refs.childrequest.init(); break;
                case 'friend':
                    vm.$refs.childfriend.init(); break;
                case 'block':
                    vm.$refs.childblock.init(); break;
            }
            this.appModel.state = state

        },
        urlBack() {
            f_urlBack()
        }
    }
})

app.component('chat-component', {
    template: '#chat-template',
    data() {
        return {
            message:'',
            item: {},
            index: -1,
            list: [], //{ userId: 0,chat: []}
            userIndex: -1,
            listUser: [],
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
        init(item) {
            this.item = item;
            this.getUser();
        },
        getUser() {
            this.appModel.loding = true;

            var targetUserId = this.item.senderID
            if (targetUserId == userId)
                targetUserId = this.item.receiverID;

            this.userIndex = this.listUser.map(x => x.Id).indexOf(targetUserId);
            if (this.userIndex > -1) {
                this.getMessages();
                return
            };

            connection.invoke("InitMessage", key, targetUserId);

        },
        getMessages() {
            var model = {
                userId: this.item.senderID
            };
            if (model.userId == userId)
                model.userId = this.item.receiverID;

            this.index = this.list.map(x => x.userId).indexOf(model.userId);
            if (this.index > -1) {
                this.appModel.state = 'chat';
                scrollEl('#roomList', true);
                this.appModel.loding = false;
                return
            };

            this.index = this.list.length;
            let url = urlMessageListForRoom + model.userId;

            appHttp(url).then((data) => {
                data.map((item) => {
                    item.my = item.senderID == userId ? true : false;
                    item.pTime = item.lastDate.getTime();
                    item.pDate = item.lastDate.toJalaaliString();
                });
                this.list.push({ userId: model.userId, chat: data.reverse() });
                this.appModel.state = 'chat';
                scrollEl('#roomList', true);
            }).finally(() => this.appModel.loding = false);

        },
        resetModal() {
            this.message = '';
            this.index = -1;
            this.userIndex = -1;
            this.item = {};
            vm.changeState('message');
        },
        addMessage() {
            if (!this.message.isNullOrEmpty()) {
                let model = {
                    l: this.list[this.index].chat.length,
                    my: true,
                    text: this.message,
                    loding: true
                }
                this.list[this.index].chat.push(model);
                connection.invoke("AddMessage", key, this.list[this.index].userId, model.text, model.l);
            }
            this.message = '';
            scrollEl('#roomList', true);
        },
        setMessage(obj, i) {
            this.list[this.index].chat[i] = {
                my: true,
                pTime: obj.Date.getTime(),
                pDate: obj.Date.toJalaaliString(),
                receiverID: obj.ReceiverID,
                senderID: obj.SenderID,
                text: obj.Text,
                lastDate: obj.Date
            }
            let userIndex = this.listUser.map(x => x.Id).indexOf(obj.ReceiverID);
            if (userIndex > -1)
                vm.$refs.childmessage.setTargetMessage("", {
                    userName: this.listUser[userIndex].UserName,
                    SenderID: obj.ReceiverID,
                    Text: obj.Text,
                    Date: obj.Date
                });
        },
        setTargetMessage(objMsg) {
            var index = this.list.map(x => x.userId).indexOf(objMsg.SenderID);
            if (index > -1) {
                this.list[index].chat.push({
                    lastDate: objMsg.Date,
                    pDate: objMsg.Date.toJalaaliString(),
                    pTime: objMsg.Date.getTime(),
                    receiverID: objMsg.ReceiverID,
                    senderID: objMsg.SenderID,
                    text: objMsg.Text,
                });
            }
            if (this.index < 0 || objMsg.SenderID != this.list[this.index].userId) {
                pushSuccessMessage({ comment: `پیام جدید\n ${objMsg.Text}` });
            }
            else {
                scrollEl('#roomList', true);
            }
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
                    item.pTime = item.lastDate.getTime();
                    item.pDate = item.lastDate.toJalaaliString();
                });
                this.list = data
            }).finally(() => this.appModel.loding = false);
        },
        setTargetMessage(friendData, objMsg) {

            let item;
            let objFriend;
            let removeIndex = -1;

            removeIndex = this.list.map(x => x.userName).indexOf(objMsg.userName);

            if (removeIndex > -1) {
                item = this.list.splice(removeIndex, 1)[0];
            }
            else {
                objFriend = JSON.parse(friendData);
                item = {
                    img: objFriend.Img,
                    name: objFriend.FirstName,
                    receiverID: userId,
                    senderID: objFriend.Id,
                    userName: objFriend.UserName,
                };
            }
            
            item.text = objMsg.Text;
            item.lastDate = objMsg.Date;
            item.pTime = item.lastDate.getTime();
            item.pDate = item.lastDate.toJalaaliString();
            this.list.unshift(item);

        },
        chat(item) {
            vm.$refs.childchat.init(item);
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
            menu:false,
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
        sendMessage() {
            this.menu = false;
            removeIndex = vm.$refs.childmessage.list.map(x => x.userName).indexOf(this.modal.item.userName);

            var item = {
                img: this.modal.item.img,
                name: this.modal.item.name,
                receiverID: userId,
                senderID: this.modal.item.userId,
                userName: this.modal.item.userName,
                text: '...',
                lastDate: this.modal.item.date,
                pTime: this.modal.item.date.getTime(),
                pDate: this.modal.item.date.toJalaaliString()
            };
            if (removeIndex == -1) {
                vm.$refs.childmessage.list.push(item);
            }
            vm.$refs.childchat.init(item);
        },
        okModal() {
            this.menu = false;
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

app.config.globalProperties.publicApiBaseUrl = publicApiBaseUrl;

vm = app.mount('#app');
initSoket();


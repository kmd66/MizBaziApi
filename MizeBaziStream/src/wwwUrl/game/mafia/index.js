﻿import './share'
import './socketHandler'
import './main'
import './help'
import './chaos'
import '../sticker'
import '../itemclick'
import '../gameresponse'

const app = Vue.createApp({
    data() {
        return {
            appModel: {
                state: '_state',
                loding: true,
                nightMode: false
            },
        }
    },
    created() {
        this.$nextTick(() => {
            setMainTemplate();
        });
    },
    methods: {
        changeState(state) {
            if (this.appModel.state == state) return;

            switch (state) {
                case 'main':
                    vm.$refs.childmain.init(); break;
                case 'gameresponse':
                    vm.$refs.childGameresponse.init(); break;
                case 'chaos':
                    vm.$refs.childchaos.init(); break;
            }
            this.appModel.state = state;
        }
    }
})
main.Component(app);
help.Component(app);
chaos.Component(app);
sticker.Component(app);
itemclick.Component(app);
gameresponse.Component(app);

document.addEventListener("DOMContentLoaded", () => {
    vm = app.mount('#app');
    socketHandler.initSoket();
});
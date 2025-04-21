import './share'
import './socketHandler'
import './main'
import './paint'
import './imgsForSpy'
import './help'
import '../sticker'
import '../itemclick'
import './defae'
import '../gameresponse'


const app = Vue.createApp({
    data() {
        return {
            appModel: {
                state: '_state',
                loding: true
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
            switch (state) {
                case 'main':
                    vm.$refs.childmain.init();
                    break;
                case 'paint':
                    vm.$refs.childpaint.init(); break;
                case 'imgsForSpy':
                    vm.$refs.childimgsForSpy.init(); break;
                case 'help':
                    vm.$refs.childhelp.init(); break;
                case 'defae':
                    vm.$refs.childdefae.init(); break;
                case 'gameresponse':
                    vm.$refs.childGameresponse.init(); break;
            }
            this.appModel.state = state;
        }
    }
})
main.Component(app);
paint.Component(app);
imgsForSpy.Component(app);
help.Component(app);
sticker.Component(app);
itemclick.Component(app);
defae.Component(app);
gameresponse.Component(app);

document.addEventListener("DOMContentLoaded", () => {
    vm = app.mount('#app');
    socketHandler.initSoket();
});
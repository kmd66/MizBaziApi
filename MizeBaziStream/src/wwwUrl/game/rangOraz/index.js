import './share'
import './socketHandler'
import './main'
import './paint'
import './imgsForSpy'
import './help'
import '../sticker'


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
vm = app.mount('#app');
socketHandler.initSoket();
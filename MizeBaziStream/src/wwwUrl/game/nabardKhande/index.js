import './share'
import './socketHandler'
import './main'
import './help'
import './soalpich'
import '../sticker'
import './labkhoni'
//import '../itemclick'

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
                case 'soalPich':
                    vm.$refs.childsoalpich.init(); break;
                default:
                    vm.$refs.childmain.init(); break;
                case 'labKhoni':
                    vm.$refs.childlabkhoni.init(); break;
            }
            this.appModel.state = state;
        }
    }
})
main.Component(app);
help.Component(app);
soalpich.Component(app);
labkhoni.Component(app);
sticker.Component(app);
//itemclick.Component(app);
//gameresponse.Component(app);

document.addEventListener("DOMContentLoaded", () => {
    vm = app.mount('#app');
    socketHandler.initSoket();
});
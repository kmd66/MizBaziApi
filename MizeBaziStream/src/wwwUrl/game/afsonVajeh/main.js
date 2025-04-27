import './mainExcess'
main.reset = function () {
}

main.Component = function (app) {
    app.component('main-component', {
        template: '#main-template',
        data() {
            return {
                iconClass: {},
                mainTopTime: '- ----',
                iconNaghsh:'icon-information4',
                door: '-',
                progressbarWidth: '0px',
                soundDivI: false,
                cancelBtn: false,

                user: {},
                users: [],// usersStatus: [],

                msg: {}
            }
        },
        methods: {
            init() {
            },
        }
    });
}
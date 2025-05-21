labkhoni.Component = function (app) {
    app.component('labkhoni-component', {
        template: '#labkhoni-template',
        data() {
            return {
                topTime: '- ----',
                naghsh: {},
                door: '-',
                progressbarWidth: '0px',
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
            },
        }
    });

} 
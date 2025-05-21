labkhoni.Component = function (app) {
    app.component('labkhoni-component', {
        template: '#labkhoni-template',
        data() {
            return {
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
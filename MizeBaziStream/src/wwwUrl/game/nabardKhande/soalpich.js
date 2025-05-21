soalpich.Component = function (app) {
    app.component('soalpich-component', {
        template: '#soalpich-template',
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
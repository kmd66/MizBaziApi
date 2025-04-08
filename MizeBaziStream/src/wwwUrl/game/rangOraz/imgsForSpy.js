imgsForSpy.Component = function (app) {
    app.component('imgs-for-spy-component', {
        template: '#imgsForSpy-template',
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
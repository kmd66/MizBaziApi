help.Component = function (app) {
    app.component('help-component', {
        template: '#help-template',
        data() {
            return {
                helpComment: HELP_RANGORAZ_COMMENT,
                selectItem: {},
                selectType: 0,
            }
        },
        props: {
            appModel: {
                type: Object,
                required: true,
                default: () => ({})
            },
        },
        created() {
            this.selectItem = this.helpComment[0];
        },
        methods: {
            init() {
            },
            changeSelectType(item) {
                this.selectItem = item;
                this.selectType = item.type
            }
        }
    });
}
<style lang="less" src="./style.less"></style>
<template>
    <div class="vue-html5-editor" :style="{'z-index':zIndex}" :class="{'full-screen':fullScreen}">
        <div class="toolbar" :style="{'z-index':zIndex+1}" ref="toolbar">
            <ul>
                <li v-for="module in visibleModules" :title="locale[module.i18n]"
                    @click="activeModule(module)">
                    <span class="icon" :class="module.icon"></span>
                </li>
            </ul>
            <div class="dashboard" v-show="dashboard" :style="dashboardStyle">
                <div :is="dashboard" keep-alive></div>
            </div>
        </div>
        <div class="content" ref="content" contenteditable="true" @click="toggleDashboard(dashboard)"
             :style="contentStyle">
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            content: {
                //no longer be required
                //twoWay: true,
                type: String,
                required: true,
                default: ""
            },
            height: {
                type: Number,
                default: 300
            },
            zIndex: {
                type: Number,
                default: 1000
            },
            autoHeight: {
                type: Boolean,
                default: true
            }
        },

        data () {
            return {
                //locale: {},
                fullScreen: false,
                dashboard: null,
                dashboardStyle: {},
            }
        },
        watch: {
            content(val) {
                let content = this.$refs.content.innerHTML
                if (val != content) {
                    this.$refs.content.innerHTML = val
                }

            },
            dashboard(val){
                if (val) {
                    this.computeDashboardStyle()
                }
            }
        },

        computed: {
            contentStyle(){
                let style = {}
                if (this.fullScreen) {
                    style.height = window.innerHeight - (this.$refs.toolbar.clientHeight + 1) + "px"
                    return style
                }
                if (!this.autoHeight) {
                    style.height = this.height + 'px'
                    return style
                }
                style["min-height"] = this.height + 'px'
                return style
            },

            visibleModules: function() {
                return this.modules.filter(module => module.show);
            }
        },
        methods: {
            computeDashboardStyle(){
                this.dashboardStyle = {'max-height': this.$refs.content.clientHeight + 'px'}
            },
            getContentElement(){
                return this.$refs.content
            },
            toggleFullScreen(){
                this.fullScreen = !this.fullScreen
            },
            toggleDashboard(dashboard){
                this.dashboard == dashboard ? this.dashboard = null : this.dashboard = dashboard
            },
            execCommand(command, arg){
                this.restoreSelection();
                document.execCommand(command, false, arg);
                this.$emit("update", this.$refs.content.innerHTML);
                this.dashboard = null;
            },
            getCurrentRange(){
                return this.range
            },
            saveCurrentRange(){
                let selection = window.getSelection ? window.getSelection() : document.getSelection()
                let range = selection.rangeCount ? selection.getRangeAt(0) : null
                if (!range) {
                    return
                }
                if (this.$refs.content.contains(range.startContainer) &&
                        this.$refs.content.contains(range.endContainer)) {
                    this.range = range
                }
            },
            restoreSelection(){
                let selection = window.getSelection ? window.getSelection() : document.getSelection()
                selection.removeAllRanges()
                if (this.range) {
                    selection.addRange(this.range)
                } else {
                    let content = this.$refs.content
                    let div = document.createElement("div")
                    let range = document.createRange()
                    content.appendChild(div)
                    range.setStart(div, 0)
                    range.setEnd(div, 0)
                    selection.addRange(range)
                }
            },
            activeModule(module){
                console.log(module);
                if (typeof module.handler == "function") {
                    module.handler(this);
                }

                if (module.dashboard && module.dashboard !== this.dashboard) {
                    this.dashboard = module.dashboard;
                }

                else
                    this.dashboard = null;
            }
        },
        compiled(){
            let editor = this
            editor.modules.forEach(function (module) {
                if (typeof module.init == "function") {
                    module.init(editor)
                }
            })
        },
        mounted (){
            const self = this;
            let content = this.$refs.content;
            content.innerHTML = this.content;
            content.addEventListener("mouseup", this.saveCurrentRange, false);
            content.addEventListener("keyup", this.saveCurrentRange, false);
            content.addEventListener("mouseout", this.saveCurrentRange, false);
            content.addEventListener("keyup", function () {
                self.$emit("update", self.$refs.content.innerHTML);
            }, false);

            self.touchHandler = function (e) {
                if (self.$refs.content.contains(e.target)) {
                    this.saveCurrentRange();
                }
            };

            window.addEventListener("touchend", self.touchHandler, false);

        },
        beforeDestroy(){
            let editor = this
            window.removeEventListener("touchend", editor.touchHandler)
            editor.modules.forEach(function (module) {
                if (typeof module.destroyed == "function") {
                    module.destroyed(editor)
                }
            })
        }
    }
</script>
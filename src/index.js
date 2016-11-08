import editor from "./editor.vue";
import moduleText from "./modules/text/index";
import moduleFont from "./modules/font/index";
import moduleColor from "./modules/color/index";
import moduleAlign from "./modules/align/index";
import moduleList from "./modules/list/index";
import moduleLink from "./modules/link/index";
import moduleUnlink from "./modules/unlink/index";
import moduleTable from "./modules/table/index";
import moduleImage from "./modules/image/index";
import moduleHr from "./modules/hr";
import moduleEraser from "./modules/eraser/index";
import moduleUndo from "./modules/undo/index";
import moduleFullScreen from "./modules/full-screen/index";
import i18nEnUs from "./i18n/en-us";


module.exports = {
    install: (Vue, options) => {

        options = options || {};

        //modules
        let modules = [
            moduleText,
            moduleColor,
            moduleFont,
            moduleAlign,
            moduleList,
            moduleLink,
            moduleUnlink,
            moduleTable,
            moduleImage,
            moduleHr,
            moduleEraser,
            moduleUndo,
            moduleFullScreen
        ]
        //extended modules
        if (Array.isArray(options.modules)) {
            modules = modules.concat(options.modules.filter(module => module.name))
        }

        //hidden modules
        if (Array.isArray(options.hiddenModules)) {
            modules = modules.filter(module => !~options.hiddenModules.indexOf(module.name))
        }

        //visible modules
        if (Array.isArray(options.visibleModules)) {
            modules = modules.filter(module => ~options.visibleModules.indexOf(module.name));
        }

        let components = {};

        for (let i = 0; i < modules.length; i++) {
            const module = modules[i];

            //specify the config for each module in options by name
            module.config = Vue.util.extend(module.config || {}, options[module.name] || {})

            if (module.dashboard) {
                //$options.module
                module.dashboard.module = module
                components[module.name] = module.dashboard
            }

            if (options.icons && options.icons[module.name]) {
                module.icon = options.icons[module.name]
            }

            //prevent vue sync
            //module.dashboard = null
        }

        //i18n
        let i18n = { "en-us": i18nEnUs}
        let customI18n = options.i18n || {}
        Object.keys(customI18n).forEach((key)=> {
            i18n[key] = i18n[key] ? Vue.util.extend(i18n[key], customI18n[key]) : customI18n[key]
        })
        let language = options.language || "en-us"
        let locale = i18n[language] || i18n["en-us"]


        let component = Vue.extend(editor).extend({
            data () {
                return {modules, locale}
            },
            components
        })

        Vue.component(options.name || "html-editor", component)
    }
}

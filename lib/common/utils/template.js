define(['underscore'], function (_) {

    'use strict';

    var defaultTemplateEngineName = 'micro';
    var defaultExt = {
        micro: 'mt'
    };
    var _engines = {
        micro: {
            extension: 'mt',
            handler: {
                compile: function (template) {
                    return _.template(template);
                },
                execute: function (compiledTemplate, data) {
                    return compiledTemplate(data);
                },
                engine: _.template
            }
        }
    };

    return {

        getDefaultExt: function (engineName) {
            return this.getTemplateExt() || defaultExt[engineName];
        },

        setTemplateExt: function (engineName, ext) {
            var engineDef = this.getTemplateEngineDef(engineName);
            if (engineDef) {
                engineDef.extension = ext;
            }
        },

        registerTemplateEngine: function (name, extension, handler) {
            return (_engines[name] = { extension: extension, handler: handler });
        },

        getTemplateEngine: function (engineName) {
            var engine = _engines[engineName];
            return engine ? engine.handler : undefined;
        },

        getTemplateExt: function (engineName) {
            var engineDef = this.getTemplateEngineDef(engineName);
            return engineDef ? engineDef.extension : undefined;
        },

        getTemplateEngineDef: function (engineName) {
            return _engines[engineName];
        },

        getDefaultTemplateEngine: function () {;
            return this.getTemplateEngine(defaultTemplateEngineName);
        },

        getDefaultTemplateEngineName: function () {
            return defaultTemplateEngineName;
        },

        setDefaultTemplateEngine: function (engineName) {
            var engine = _engines[engineName];
            if (!engine) {
                throw new Error('Invalid template engine name, ' + engineName);
            }

            defaultTemplateEngineName = engineName;
        }

    };

});
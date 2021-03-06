define(['underscore', 'requestFilters', 'renderer', 'handlers/app/html', 'utils/document', 'bundler', 'utils/cmpProcessor', 'httpResponse', 'backbone'],
    function (_, filter, renderer, html, doc, Bundler, cmpProcessor, httpResponse, Backbone) {

    'use strict';

    var bundle = new Bundler();
    var path = require('path');

    return {

        reply: function (route, options, callbacks) {
            var self = this;
            var ctx = cmpProcessor.createCtx(options);

            filter.apply(route, options, ctx, function (redirect) {
                if (redirect) {
                    return LAZO.app.navigate(ctx, redirect);
                }

                cmpProcessor.getAssets('app', ctx, {
                    success: function (assets) {
                        LAZO.app.assets = assets;
                        cmpProcessor.process({
                            ctx: ctx,
                            def: cmpProcessor.getDef(route),
                            success: function (ctl, ctx, cmpDef) {
                                self._buildReply(ctl, ctx, LAZO.app.assets, cmpDef, route, callbacks);
                            },
                            error: function (err) {
                                callbacks.error(err);
                            }
                        });
                    },
                    error: callbacks.error
                });
            });
        },

        _buildReply: function (ctl, ctx, appAssets, cmpDef, route, options) {
            var isDevelopment = ctx.getCookie('development') === '1' ? true : false;
            var self = this;

            function buildHtmlResponse(rootCtx, bodyHtml) {
                var tags;

                rootCtx.idCounter = _.uniqueId();
                doc.setTitle(ctl.getPageTitle());
                tags = _.map(doc.getTags(), function (tag) {
                    return _.clone(tag);
                });

                // append the per page/request tags
                tags = tags.concat(_.map(ctl.getPageTags(), function (tag) {
                    return _.clone(tag);
                }));

                function getPaths() {
                    var clientAppPaths = {};

                    // get the error template paths
                    _.each(LAZO.errorTemplates, function (tmpDef, key) {
                        clientAppPaths['' + key] = tmpDef.client;
                    });

                    return _.extend(LAZO.contexts.app.paths || {}, clientAppPaths);
                }

                function getClientPath(filePath) {
                    return filePath.replace(LAZO.FILE_REPO_DIR + path.sep, '').replace('\\', '\/');
                }
                
                // update the model data before serializing it
                var rc = ctl.ctx._rootCtx;
                if (rc 
                    && rc.modelInstances
                    && rootCtx 
                    && rootCtx.modelList) {
                    
                    _.each(rootCtx.modelList, function (value, key, list) {
                        var modelInstance = rc.modelInstances[key];
                        var modelMetaData = list[key];
                        modelMetaData.data = modelInstance.toJSON();
                        
                        // update idMap
                        if (modelInstance instanceof Backbone.Collection) {
                            modelMetaData.idMap = [];
                            modelInstance.each(function (model) {
                                modelMetaData.idMap.push({cid: model.cid, id: model.id});
                            });
                        }
                    });
                }

                return html({
                    layout: cmpDef.layout || '',
                    body: bodyHtml,
                    rootCtl: ctl.serialize(),
                    rootCtx: JSON.stringify(rootCtx),
                    dependencies: ctx._rootCtx.dependencies,
                    tags: tags,
                    files: JSON.stringify(LAZO.files),
                    htmlTag: doc.getHtmlTag(),
                    bodyClass: doc.getBodyClass(),
                    lib: isDevelopment ? false : bundle.getLibPath(),
                    config: JSON.stringify(_.extend(LAZO.contexts.app, { paths:getPaths() })),
                    args: LAZO.app.args ? JSON.stringify(LAZO.app.args) : '{}',
                    bundler: LAZO.contexts.server.paths.bundler !== LAZO.contexts.server.paths.lazoBundle ?
                        getClientPath(LAZO.contexts.server.paths.bundler) : null,
                    assets: LAZO.contexts.server.paths.assets !== LAZO.contexts.server.paths.lazoAssets ?
                        getClientPath(LAZO.contexts.server.paths.assets) : null
                });
            }

            // entry point
            (function (self) {
                var rootCtx = cmpProcessor.getRootCtxForReply(ctx, ctl);
                rootCtx.assets.app = appAssets;

                renderer.getTreeHtml(ctl, null, null, function (bodyHtml) {
                    if (isDevelopment) {
                        ctx._rootCtx.dependencies.css = bundle._createCSSLinks(LAZO.app.css.slice(0).concat(ctx._rootCtx.dependencies.css));
                        ctx._rootCtx.dependencies.imports = bundle._createImportLinks(LAZO.app.imports.slice(0).concat(ctx._rootCtx.dependencies.imports));
                        return options.success(buildHtmlResponse(rootCtx, bodyHtml), httpResponse.mergeHttpResponseData(ctl));
                    }

                    bundle.response(route, ctl.ctx.location.pathname, {
                        success: function (modules) {
                            if (modules) {
                                rootCtx.dependencies.modules = modules.js;
                                rootCtx.dependencies.css = bundle.sortCss(bundle._createCSSLinks(modules.css));
                                rootCtx.dependencies.imports = bundle.sortImports(bundle._createImportLinks(modules.imports));
                            } else { // default combo handling is a noop; return css
                                rootCtx.dependencies.css = bundle.sortCss(bundle._createCSSLinks(LAZO.app.css.slice(0).concat(ctx._rootCtx.dependencies.css)));
                                rootCtx.dependencies.imports = bundle.sortImports(bundle._createImportLinks(LAZO.app.imports.slice(0).concat(ctx._rootCtx.dependencies.imports)));
                            }

                            options.success(buildHtmlResponse(rootCtx, bodyHtml), httpResponse.mergeHttpResponseData(ctl));
                        },
                        error: function (err) {
                            throw err instanceof Error ? err : new Error(err);
                        }
                    });
                });
            })(this);
        },

        _include: function (rootCtx, exclude, isXHR) {
            return _.difference(_.uniq(rootCtx.modules), exclude).sort();
        },

        _hasLayoutChanged: function () {
            return LAZO.app.isClient && window.rootCtl && layout === window.rootCtl.name ? false : true;
        }

    };

});

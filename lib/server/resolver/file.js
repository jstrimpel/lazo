define(function () {

    'use strict';

    var fs = require('fs'),
        path = require('path'),
        dir = require('node-dir');

    return {

        getErrorTemplatePaths: function (callback) {
            var templatePaths = {
                    '403': {
                        server: LAZO.BASE_PATH + '/lib/common/templates/403.mt',
                        client: 'lib/common/templates/403.mt'
                    },
                    '404': {
                        server: LAZO.BASE_PATH + '/lib/common/templates/404.mt',
                        client: 'lib/common/templates/404.mt'
                    },
                    '500': {
                        server: LAZO.BASE_PATH + '/lib/common/templates/500.mt',
                        client: 'lib/common/templates/500.mt'
                    }
                },
                basename,
                clientPath,
                serverPath,
                directory = path.normalize(LAZO.FILE_REPO_PATH + '/app/' + 'views');

            this.list(directory, { ext: '.mt' }, function (err, files) {
                if (err) {
                    throw err;
                }

                for (var i = 0; i < files.length; i++) {

                    basename = path.basename(files[i], '.mt');
                    serverPath = path.normalize(files[i]);
                    clientPath = path.normalize(serverPath.replace(LAZO.FILE_REPO_PATH, '/'));
                    if (basename === '404' || basename === '500') {
                        templatePaths[basename] = {
                            server: serverPath,
                            client: clientPath
                        };
                    }
                }

                callback(null, templatePaths);
            });
        },

        resolvePath: function (from, to) {
            if (LAZO.app.isClient) {
                LAZO.logger.warn('[server.resolver.resolvePath]', 'Should not be called on client.');
                return from;
            }

            return path.resolve(from, to);
        },

        list: function (directory, options, callback) {
            var filtered = [];

            if (LAZO.app.isClient) {
                LAZO.logger.warn('[server.resolver.resolvePath]', 'Should only be called on the server.');
                return callback(null, []);
            }

            directory = options.basePath ? path.resolve(options.basePath, directory) : directory;
            fs.exists(directory, function (exists) {
                if (!exists) {
                    return callback(null, []);
                }

                dir.files(directory, function (err, files) {
                    if (err) { // TODO: error handling
                        throw err;
                    }

                    if (!options.basePath && !options.ext) {
                        return files;
                    }

                    for (var i = 0; i < files.length; i++) {
                        if (options.ext && path.extname(files[i]) !== options.ext) {
                            continue;
                        }
                        files[i] = options.basePath ? files[i].replace(options.basePath + '/', '') : files[i];
                        filtered.push(files[i]);
                    }

                    callback(err, filtered || []);
                });
            });
        }

    };

});
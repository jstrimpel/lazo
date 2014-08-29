define(['assetsProvider'], function (assetsProvider) {

    'use strict';

    return Base.extend({

        get: function (components, options) {
            assetsProvider.get(components, options);
        },

        getLocales: function () {
            return assetsProvider.getLocales(components, options);
        },

        resolveAsset: function (key, list) {
            var locales = this.locales();
            return assetsProvider.resolveAsset(key, list, locales);
        },

        resolveAssetKey: function (key) {
            return assetsProvider.resolveAssetKey(key);
        },

        resolveAssetPath: function (path) {
            return assetsProvider.resolveAssetPath(path);
        }

    });

});
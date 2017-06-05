/**
 * @author liangxiao
 * @version [v1.0]
 * @description 异步加载api
 */

/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/
/*global define: true*/
define(function (require, exports) {
    'use strict';

    var eMap = {};
    var res = '${resourceURL}';
    var version = '${resourceVersion}';
    var renderMode = '${renderMode}';
    var $ = window.$;

    function seajsLoad(moduleName, callback) {
        if (eMap[moduleName]) {
            return;
        }

        eMap[moduleName] = true;

        require.async('module/' + moduleName + '/' + moduleName + '.css');
        require.async('module/' + moduleName + '/' + moduleName, function () {
            if (typeof callback !== 'function') {
                return;
            }

            callback();
        });
    }

    function loadStyle(url) {
        var style = document.createElement('link');
        style.setAttribute('type', 'text/css');
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('href', url);
        document.getElementsByTagName("head").item(0).appendChild(style);
    }

    function customLoad(moduleName, callback, isOnline) {
        if (eMap[moduleName]) {
            return;
        }

        eMap[moduleName] = true;

        var fileType = '.merge';
        if (isOnline) {
            fileType = '.min';
        }

        var styleURI = res + 'module/' + moduleName + '/' + moduleName + fileType + '.css?' + version;
        var scriptURI = res + 'module/' + moduleName + '/' + moduleName + fileType + '.js?' + version;
        loadStyle(styleURI);
        $.getScript(scriptURI, function () {
            if (typeof callback !== 'function') {
                return;
            }

            callback();
        })
    }

    function asyncLoadModule(moduleName, callback) {
        if (renderMode === 'debug' || renderMode === 'debug-ie') {
            seajsLoad(moduleName, callback);
            return;
        }

        if (renderMode === 'test') {
            customLoad(moduleName, callback);
            return;
        }

        if (renderMode === 'online') {
            customLoad(moduleName, callback, true);
            return;
        }
    }

    window.mdev = window.mdev || {};
    window.mdev.asyncLoadModule = asyncLoadModule;
});

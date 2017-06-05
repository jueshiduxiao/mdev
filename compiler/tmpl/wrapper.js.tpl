define(function (require, exports, module) {
    //'use strict';

    var $ = window.$;
    var mdev = $.extend({}, window.mdev, {
        dom: 'limit access'
    });

    #if($dom)
        mdev.dom = $.extend({}, window.mdev.dom, { build: 'limit access' });
        #if($selector)
            mdev.dom.build = function (handle) {
                window.mdev.dom.build('$selector', handle);
            };
            mdev.dom.getInstance = function (handle) {
                window.mdev.dom.getInstance('$selector', handle);
            };
        #end

        // message
        mdev.message = $.extend({}, window.mdev.message);
        mdev.message.listen = function (handler) {
            var selector = '$selector';
            var moduleName = selector.match(/\.module-(.*)/)[1];
            window.mdev.message.listen.call(window, moduleName, handler);
        };

        // push mods
        (function () {
            var selector = '$selector';
            if (!selector.match(/\.module-(.*)/)) {
                return
            };
            var moduleName = selector.match(/\.module-(.*)/)[1];
            mdev.modules.push(moduleName);
        }());
    #end

    return (function (document, jQuery, $, _) {
        /*code*/
    }());
});

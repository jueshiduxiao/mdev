/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/

/**
 * @description 公共库
 * @author liangxiao
 * @update 2015-01-06 liangxiao
 */

(function () {
    'use strict';

    // root namespace
    var app = {};

    // vars
    var $ = window.jQuery;
    var velocity = window.velocityjs;

    /***************************************************************************
    ** extend api
    ***************************************************************************/
    // tmpl
    app.tmpl = function (string, context) {
        return velocity.render(string, context);
    };
    // wrapDom
    app.wrapDom = function (dom) {
        if (typeof dom !== 'object') {
            return;
        }

        return $(dom);
    };
    // ajax
    app.ajax = function (args) {
        args.type = args.type || 'GET';
        args.cache = args.cache || 'false';
        args.dataType = args.dataType || 'json';

        $.ajax(args);
    };
    // $win
    app.$win = $(window);
    // brower
    app.browser = $.browser;

    window.mdev = app;
}());

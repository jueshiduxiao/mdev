/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/

/**
 * @description
 * @author liangxiao
 * @update 2015-01-06 liangxiao
 */
(function () {
    'use strict';

    var $ = window.$;
    var _ = window._;

    /*---------------------------------------*
    * Array
    *---------------------------------------*/
    (function (ap) {
        // indexOf
        if (ap.indexOf) {
            return;
        }

        ap.indexOf = function (value) {
            return _.indexOf(this, value);
        };

        // forEach
        if (ap.forEach) {
            return;
        }

        ap.forEach = function (value) {
            return _.each(this, value);
        };
    }(Array.prototype));

    /*---------------------------------------*
    * Function
    *---------------------------------------*/
    (function (fp) {
        // bind
        if (fp.bind) {
            return;
        }

        fp.bind = function (thisContext) {
            var thisFunction = this;
            return function () {
                return thisFunction.apply(thisContext, arguments);
            };
        };
    }(Function.prototype));

    /*---------------------------------------*
    * String
    *---------------------------------------*/
    (function (sp) {
        // trim
        if (sp.trim) {
            return;
        }

        sp.trim = function () {
            return $.trim(this);
        };
    }(String.prototype));

    /*---------------------------------------*
    * Interval | Timeout
    *---------------------------------------*/
    (function (w) {
        var wi = w.setInterval;
        var wt = w.setTimeout;

        w.setInterval = function () {
            var args = arguments;
            var func = args[0];
            var delay = args[1];
            var newArgs = Array.prototype.slice.call(args, 2);

            return wi(function () {
                func.apply(window, newArgs);
            }, delay);
        };
        w.setTimeout = function () {
            var args = arguments;
            var func = args[0];
            var delay = args[1];
            var newArgs = Array.prototype.slice.call(args, 2);

            return wt(function () {
                func.apply(window, newArgs);
            }, delay);
        };
    }(window));
}());

/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/
/*global mdev: true, console: true, require: true*/

/**
 * @author liangxiao
 * @version [v1.0] 2013-01-28
 * @description demo4.js
 */

// build module
mdev.dom.build(function ($mod) {
    $mod.delegate('div[node-type~="title"]', 'click', function (e) {
        mdev.message.trigger('demo4-1, demo4-2', 'title:click');
    });
});

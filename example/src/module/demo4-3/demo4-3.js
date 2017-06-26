/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/
/*global mdev: true, console: true, require: true*/

/**
 * @author liangxiao
 * @version [v1.0] 2013-12-09
 * @description demo4-3.js
 */

// build module
mdev.dom.build(function ($mod) {
    $mod.delegate('div[node-type~="title"]', 'click', function (e) {
        mdev.message.triggerForce('demo4-1, demo4-2', 'title:click');
    });
});

/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/
/*global mdev: true, console: true, require: true*/

/**
 * @author liangxiao
 * @version [v1.0] 2013-01-28
 * @description demo4-1.js
 */

// build module
mdev.dom.build(function ($mod) {
    // listen
    mdev.message.listen(function (command) {
        if (command !== 'title:click') {
            return;
        }

        var $img = $mod.find('img[node-type~="slide-img"]');
        var tmp = $img.attr('src');
        $img.attr('src', $img.data('src')).data('src', tmp);
    });
});

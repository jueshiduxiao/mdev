/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/
/*global mdev: true, console: true, require: true*/

/**
 * @author liangxiao
 * @version [v1.0] 2013-11-28
 * @description demo4-2.js
 */

// init data
var tmpl = require('./pagelet.html');

// listen
mdev.message.listen(function (command) {
    if (command !== 'title:click') {
        return;
    }

    // show dialog
    window.setTimeout(function () {
        mdev.dom.dialog(mdev.tmpl(tmpl, cxt));
    }, 1000);

    // build module
    mdev.dom.build(function ($mod) {
        // add event
        $mod.delegate('div[node-type~="title"]', 'click', function (e) {
            var $title = $mod.find('div[node-type~="title"]');
            if ($title.data('tag')) {
                $title.css('color', 'red');
                $title.data('tag', false);
            } else {
                $title.css('color', 'green');
                $title.data('tag', true);
            }
        });
    });
});

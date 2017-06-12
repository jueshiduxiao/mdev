/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/
/*global mdev: true, console: true, require: true*/

/**
 * @author liangxiao
 * @version [v1.0] 2013-01-28
 * @description demo.js
 */

// init data
console.log('demo');

var add = require('./demo_other');
console.log('demo_other:add', add(20, 2000));

// build module
mdev.dom.build(function ($mod) {
    console.log(1, 'demo');
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

mdev.dom.build(function ($mod) {
    console.log(2, 'demo');
});

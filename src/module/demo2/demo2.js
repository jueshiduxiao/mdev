/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/
/*global mdev: true, console: true, require: true*/

/**
 * @author liangxiao
 * @version [v1.0] 2013-01-28
 * @description demo2.js
 */

// init data
var data = {
    title: 'demo2',
    imgUrl: 'http://ss10.sinaimg.cn/small/630f208907c19211a12e9'
};
var tmpl = require('./pagelet.html');

// append
mdev.dom.append(mdev.tmpl(tmpl, data));

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

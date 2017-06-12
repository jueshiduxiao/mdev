/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/
/*global mdev: true, exports: true, require: true*/

/**
 * @author liangxiao
 * @version [v1.0]
 * @description
 */

var tmpl = require('./tmpl-index');
mdev.ajax({
    url: '/resource/mock/index.json',
    success: function (cxt) {
        var html = mdev.tmpl(tmpl, cxt);
        mdev.dom.prepend(html);
    }
});

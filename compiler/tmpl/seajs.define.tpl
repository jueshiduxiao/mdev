/**
 * @author liangxiao
 * @version [v1.0]
 * @description
 */

/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/
/*global define: true*/
define(function (require, exports, module) {
    'use strict';

    #foreach($js in $moduleJs)
        require('${js}');
    #end
});

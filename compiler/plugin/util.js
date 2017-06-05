var path = require('path');
var fs = require('fs');

var util = {
    formatStr: function () {
        var ret = arguments[0];

        for (var i = 0; i< arguments.length - 1; i++) {
            var reg = new RegExp('\\{' + i + '\\}', 'g');
            ret = ret.replace(reg, arguments[i + 1]);
        }

        return ret;
    },
    unique: function (arr) {
        var res = [];
        for (var i = 0; i < arr.length; i++) {
            if(res.indexOf(arr[i]) === -1) {
                res.push(arr[i]);
            }
        }
        return res;
    }
};

module.exports = util;

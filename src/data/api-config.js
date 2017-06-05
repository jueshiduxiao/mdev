/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 100, plusplus: true, sloppy: true, regexp: true*/
/*global mdev: true, exports: true, require: true, module: true, console: true*/

var conf = {
    'page': {
        'index': 'http://lx.baidu.com/own/module.development/test/page/index.json'
    },
    'api': {}
};

exports.get = function (name) {
    if (typeof name !== 'string') {
        return '/api?error-key';
    }

    var reg = /^(page|api)\/(.+)/;
    var ret = reg.exec(name);
    var type, val;
    if (!ret) {
        return '/api?error-key';
    }
    type = ret[1];
    val = ret[2].trim();
    if (val === '') {
        return '/api?error-key';
    }

    // local data
    if (type === 'page' && !conf[type][val]) {
        return '/test/page/' + val + '.json';
    }
    if (type === 'api' && !conf[type][val]) {
        return '/test/api/' + val + '.json';
    }

    // proxy data
    return '/proxy?url=' + encodeURIComponent(conf[type][val]);
};

module.exports = (function (fs, path, console, seajsBuilder) {
    var _pub_static = function () {
        var _pri = {};
        var _pub = {};

        var _init = function () {
        };

        _pri['jslint'] = function () {
            var mpath = require('./path.js');
            var lint = require('jslint');
            var isPass = true;

            var report = function (data) {

                var err, evidence, i, italics, j, key, keys, length,
                    mem = '', name, names, output = [], snippets, the_function, type,
                    warning;

                if (data.errors) {
                    err = true;
                    console.warn('JSLint Errors('+ data.errors.length +'):');
                    if (data.errors) {
                        for (i = 0; i < data.errors.length; i += 1) {
                            warning = data.errors[i];
                            if (warning) {
                                evidence = warning.evidence || '';
                                console.warn(
                                    '  '
                                    +
                                    (i + 1)
                                    +
                                    ' ' + (isFinite(warning.line) ? '[' + String(warning.line) + ':' + String(warning.character) : '') + ']'
                                    +
                                    ' ' + warning.reason.entityify()
                                );
                            }
                        }
                    }
                }

            };

            function lintFile(path) {
                var code = fs.readFileSync(path, 'utf8');
                var rules = '/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 200, plusplus: true, sloppy: true, newcap: true, sub: true, regexp: true, continue: true, forin: true*/'
                        + '\n'
                        + '/*global mdev: true, require: true*/'
                        + '\n';

                if (code.indexOf('/*jslint') !== 0) {
                    code = rules + code;
                }

                var result = lint(code);

                if (!result) {
                    console.warn('JSLint failed! \'' + path.replace(/\\/g, '/').replace(/\/\//g, '/') + '\'.');
                    report(lint.data());
                }
                return result;
            }

            function walk(_path) {
                var dirList = fs.readdirSync(_path);
                dirList.forEach(function (item) {
                    var cPath = _path + '/' + item;
                    if (fs.statSync(cPath).isDirectory()) {
                        walk(cPath);
                    } else {
                        if (!item.match(/.js$/)) {
                            return;
                        }

                        var jsLintIgnore = 'src//lib/';
                        if (cPath.indexOf(jsLintIgnore) !== -1) {
                            return;
                        }
                        if (!lintFile(cPath)) {
                            isPass = false;
                        }
                    }
                });
            }
            walk(mpath.src);

            return isPass;
        };

        _pub['run'] = function () {
            // jslint
            _pri.jslint();

            return true;
        };

        if (this === 'test') {
            _pub._pri = _pri;
            _pub._init = _init;
        } else {
            _init.apply(_pub, arguments);
        }

        return _pub;
    };

    return new _pub_static();
})(
    require('fs'),
    require('path'),
    new require('nodejs-console')('compiler.checker')
);

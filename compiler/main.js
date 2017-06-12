module.exports = (function (fs, path, console) {
    var _pub_static = function () {
        var _pri = {};
        var _pub = {};

        var _init = function () {
            _pub.buildDir = require('./path.js').build;
            //console.log('init.');
        };

        _pri['getProjectContext'] = function () {
            var mpath = require('./path.js');
            var vmHelper = require('./plugin/velocity.helper.js');
            var projectTemplate = vmHelper.getTemplate(mpath.srcProjectConf);
            var projectVars = vmHelper.getContext(projectTemplate);
            projectVars.resourceVersion = +new Date();

            return projectVars;
        };

        _pri['check'] = function () {
            var checker = require('./checker.js');
            var result = checker.run();
            if (!result) {
                console.error('game over! the src code has errors.');
            }
            return result;
        };

        _pub['buildDir'] = undefined;

        _pub['build'] = function () {
            console.log('project build start...');

            // check src code
            var path = './src/';
            var tools = require('nodejs-tools');
            var pdemo = require('./path.js').mdev + 'example/';
            if (!fs.existsSync(path)) {
                tools.file.cpdir(pdemo, path);
            }

            var proCxt = _pri.getProjectContext();

            // check
            if (!_pri.check()) {
                return;
            };

            // pub resource
            var res = require('./resource.js');
            res.publish(proCxt.resourceURL, proCxt.resourceVersion,
                proCxt.renderMode);

            // output
            var output;
            if (proCxt.pageRender === 'server'
                && proCxt.renderOptimize === 'BigPipe') {
                output = require('./output.bigpipe.js');
                output.run(proCxt);
            } else {
                output = require('./output.normal.js');
                output.run(proCxt);
            }

            // process static resoure
            res.build(proCxt.renderMode);

            console.log('project build end.');
        };

        _pub['buildWatch'] = function () {
            _pub.build();

            var proCxt = _pri.getProjectContext();
            if (!(proCxt.renderMode === 'debug')) {
                console.warn('watch project only for the "debug" mode.');
                return;
            }

            console.log('start watch project ...');

            var mpath = require('./path.js');

            var fn = (function () {
                var proRes = function (fileName, proCxt) {
                    fileName = fileName.replace(/\\/g, '/').replace(/\/+/, '/');
                    fileName = fileName.split('src/')[1];

                    console.log('changed: \'' + fileName + '\'');

                    var srcFile = mpath.src + fileName;
                    var buildFile = mpath.buildResource + fileName;
                    var tools = require('nodejs-tools');
                    var file = tools.file;
                    var res = require('./resource.js');

                    if (!fs.existsSync(srcFile)) {
                        console.log('unbuild: \'' + fileName + '\'');
                        return;
                    }

                    if (fs.statSync(srcFile).isDirectory()) {
                        file.cpdir(srcFile, buildFile);
                    } else {
                        file.cp(srcFile, buildFile);
                        if (fileName.match(/\.css$/)) {
                            res.proCss(buildFile, proCxt.resourceURL, proCxt.resourceVersion);
                        } else if (fileName.match(/\.js$/)) {
                            res.wrapJs(buildFile);
                        } else if (fileName.match(/module|layout.*\.html$/) || fileName.match(/page.*\.conf$/) || fileName.match(/data.*\.vm$/)) {
                            (function () {
                                fs.writeFileSync(buildFile + '.js', tools.htmlToJs(fs.readFileSync(srcFile, 'utf8')), 'utf8');

                                require('./compiler.js').compile();
                                var output = require('./output.normal.js');
                                output.run(proCxt);
                            }());
                        }
                    }

                    console.log('build: \'' + fileName + '\'');
                };

                var proCxt = _pri.getProjectContext();
                var list = [];
                var timer;

                return function (type, fileName) {
                    if (fileName.indexOf('.swp') > -1) {
                        return;
                    }
                    list.push({ type: type, fileName: fileName });
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        list.forEach(function (item) {
                            if (item.type === 2 || item.type === 1) {
                                proRes(item.fileName, proCxt);
                            }
                        });
                        list = [];
                    }, 0);
                };
            }());

            var tools = require('nodejs-tools');
            tools.watch(mpath.src, function (data) {
                var k, v;
                for (k in data) {
                    v = data[k];
                    if (v === 'add') {
                        fn(1, k);
                    }
                    if (v === 'edit') {
                        fn(2, k);
                    }
                    if (v === 'del') {
                        fn(3, k);
                    }
                }
            });
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
    new require('nodejs-console')('compiler')
);

module.exports = (function (fs, path, console, seajsBuilder) {
    var _pub_static = function () {
        var _pri = {};
        var _pub = {};

        var _init = function () {
            var mpath = require('./path.js');
            _pri.buildPath = mpath.buildResource + 'build/';

            // close log
            seajsBuilder.conf({ debug: false });
        };

        _pri['buildPath'] = undefined;

        _pri['buildAsyncFile'] = function (resourceURL, resourceVersion, renderMode) {
            var mpath = require('./path.js');
            var vmHelper = require('./plugin/velocity.helper.js');
            var asyncFile = mpath.buildResource + 'mdev.plugin/async.js';
            var code = fs.readFileSync(asyncFile, 'utf8');
            var cxt = {
                resourceURL: resourceURL,
                resourceVersion: resourceVersion,
                renderMode: renderMode
            };
            code = vmHelper.render(code, cxt);
            fs.writeFileSync(asyncFile, code, 'utf8');
        };

        _pri['wrapJs'] = function (fileFullName) {
            var mpath = require('./path.js');
            var vmHelper = require('./plugin/velocity.helper.js');
            var dirname = path.dirname(fileFullName);
            var basename = path.basename(fileFullName, '.js');
            var selector, isOpenDom;

            var list = [
                'resource/lib/'
            ];

            var tag = false;
            fileFullName = fileFullName.replace(/\\/g, '/');
            list.forEach(function (item) {
                if (fileFullName.match(new RegExp(item))) {
                    tag = true;
                }
            });
            if (tag) {
                return;
            }

            if (dirname.match(new RegExp('[\\\\|\\/]' + basename))) {
                isOpenDom = true;
                selector = 'div[node-type~="module"].module-' + basename;
            }

            if (dirname.match(/[\\|\/]data$/)) {
                isOpenDom = true;
            }

            var tmpl = fs.readFileSync(mpath.tmplJsPack, 'utf8');
            tmpl = vmHelper.render(tmpl, { selector: selector, dom: isOpenDom });

            var space = '                                                     '
                      + '                                                     ';

            tmpl = tmpl.split('/*code*/');
            tmpl[2] = tmpl[1];
            tmpl[1] = fs.readFileSync(fileFullName, 'utf8');

            fs.writeFileSync(fileFullName, tmpl.join('\n'), 'utf8');
        };

        _pri['proCss'] = function (fileFullName, resUrl, resVer) {
            var css = fs.readFileSync(fileFullName, 'utf8');
            var proRes = require('./process.resource.js');
            css = proRes.proCssUrl(css, resUrl);
            css = proRes.proCssImgUrl(css, resUrl, resVer);
            fs.writeFileSync(fileFullName, css, 'utf8');
        };

        _pri['mergeModule'] = function () {
            var mpath = require('./path.js');
            var proRes = require('./process.resource.js');
            var rpath = mpath.buildResource + 'module/';
            var mods = fs.readdirSync(rpath);
            mods.forEach(function (mod) {
                var fpath = rpath + mod;
                if (!fs.statSync(fpath).isDirectory()) {
                    return;
                }

                var cssFile = path.resolve(fpath + '/' + mod + '.css');
                var cssMergeFile = path.resolve(fpath + '/' + mod + '.merge.css');
                if (fs.existsSync(cssFile)) {
                    proRes.buildCssFile(cssFile, mpath.buildResource, cssMergeFile);
                }

                try {
                    var scriptFile = path.resolve(fpath + '/' + mod + '.js');
                    if (!fs.existsSync(scriptFile)) {
                        return;
                    }
                    seajsBuilder.build(scriptFile, mpath.buildResource, scriptFile.replace('.js', '.merge.js'));
                } catch (e) {
                    console.error('seajs build error: "' + scriptFile + '"');
                }
            });
        };

        _pri['minModule'] = function () {
            var CleanCSS = require('clean-css');
            var uglifyjs = require('uglify-js');
            var mpath = require('./path.js');
            var minCss = new CleanCSS();
            var rpath = mpath.buildResource + 'module/';
            var mods = fs.readdirSync(rpath);
            mods.forEach(function (mod) {
                var fpath = rpath + mod;
                if (!fs.statSync(fpath).isDirectory()) {
                    return;
                }

                var cssFile = rpath + mod + '/' + mod + '.merge.css';
                var buildCssFile = rpath + mod + '/' + mod + '.min.css';
                var code = fs.readFileSync(cssFile, 'utf8');
                code = minCss.minify(code);
                fs.writeFileSync(buildCssFile, code, 'utf8');

                console.log('module css min. "' + buildCssFile);

                var scriptFile = rpath + mod + '/' + mod + '.merge.js';
                var buildScriptFile = rpath + mod + '/' + mod + '.min.js';
                var minJs = uglifyjs.minify(scriptFile);
                fs.writeFileSync(buildScriptFile, minJs.code, 'utf8');

                console.log('module js min. "' + buildScriptFile);
            });
        };

        _pri['min'] = function () {
            var CleanCSS = require('clean-css');
            var uglifyjs = require('uglify-js');
            var mpath = require('./path.js');
            var files = fs.readdirSync(_pri.buildPath);
            var file = require('nodejs-tools').file;
            var minCss = new CleanCSS();

            files.forEach(function (v) {
                if (!v.match(/.css$/)) {
                    return;
                }

                var cssFile = _pri.buildPath + v;
                var buildCssFile = _pri.buildPath + v.replace('.merge.css', '.min.css');
                var code = fs.readFileSync(cssFile, 'utf8');
                code = minCss.minify(code);
                fs.writeFileSync(buildCssFile, code, 'utf8');
                file.rm(cssFile);

                console.log('merge css min. "' + buildCssFile);
            });

            files.forEach(function (v) {
                if (!v.match(/.js$/)) {
                    return;
                }

                var scriptFile = _pri.buildPath + v;
                var buildScriptFile = _pri.buildPath + v.replace('.merge.js', '.min.js');
                var minJs = uglifyjs.minify(scriptFile);
                fs.writeFileSync(buildScriptFile, minJs.code, 'utf8');
                file.rm(scriptFile);

                console.log('merge js min. "' + buildScriptFile);
            });

            // _pri.minModule();
            console.log('module min closed.');
        };

        _pri['merge'] = function (files) {
            var mpath = require('./path.js');
            var proRes = require('./process.resource.js');
            var files = fs.readdirSync(_pri.buildPath);
            var file = require('nodejs-tools').file;

            files.forEach(function (v) {
                if (!v.match(/.css$/)) {
                    return;
                }

                var cssFile = _pri.buildPath + v;
                var cssMergeFile = _pri.buildPath + v.replace('.css', '.merge.css');
                // 过滤两次
                proRes.buildCssFile(cssFile, mpath.buildResource, cssMergeFile);
                proRes.buildCssFile(cssMergeFile, mpath.buildResource, cssMergeFile);
                file.rm(cssFile);
            });

            console.log('css merged.');

            files.forEach(function (v) {
                if (!v.match(/.js$/)) {
                    return;
                }

                if (!v.match(/global.js$/)) {
                    return;
                }

                var scriptFile = _pri.buildPath + v;
                var scriptMergeFile = _pri.buildPath + v.replace('.js', '.merge.js');
                proRes.buildJsFile(scriptFile, mpath.buildResource, scriptMergeFile);
                file.rm(scriptFile);
            });

            console.log('js merged.');

            files.forEach(function (v) {
                if (!v.match(/.js$/)) {
                    return;
                }

                if (v.match(/global.js$/)) {
                    return;
                }

                try {
                    var scriptFile = path.resolve(_pri.buildPath + v);
                    seajsBuilder.build(scriptFile, mpath.buildResource, _pri.buildPath + v.replace('.js', '.merge.js'));

                    console.log('seajs build. "' + scriptFile);
                } catch (e) {
                    console.error('seajs build error: "' + scriptFile + '"');
                }
            });

            _pri.mergeModule();

            console.log('module merged.');
        };

        _pub['publish'] = function (resURL, resVer, renderMode) {
            var mpath = require('./path.js');
            var tool = require('nodejs-tools');
            var file = tool.file;

            // make dir
            if (fs.existsSync(mpath.build)) {
                file.rmdir(mpath.build);
            }
            fs.mkdirSync(mpath.build);
            fs.mkdirSync(mpath.buildPage);
            fs.mkdirSync(mpath.buildResource);

            // copy file
            file.cpdir(path.resolve(mpath.src), path.resolve(mpath.buildResource));




            var list = [
                'lib/datepicker.v4.8.4/WdatePicker-plus.js',
                'lib/plupload.v2.1.2/uploader.js',
                'script/util/datepicker.js'
            ];

            // walk resource, delete, build
            function walk(_path) {
                var dirList;

                dirList = fs.readdirSync(_path);
                dirList.forEach(function (item) {
                    var cPath = _path + '/' + item;
                    if (fs.statSync(cPath).isDirectory()) {
                        walk(cPath);

                        // del empty dir
                        if (fs.readdirSync(cPath).length === 0) {
                            file.rmdir(cPath);
                        }
                    } else {
                        var sPath = cPath.replace(/\\/g, '/').replace('//', '/');
                        sPath = sPath.split('resource/')[1];
                        list.forEach(function (item) {
                            if (item !== sPath) {
                                return;
                            }

                            var content = fs.readFileSync(cPath, 'utf8');
                            content = content.replace(/\/resource\//g, resURL);

                            fs.writeFileSync(cPath, content, 'utf8');
                        });

                        // build html to js
                        if (cPath.match(/module\/.*.html$/)) {
                            fs.writeFileSync(
                                cPath + '.js',
                                tool.htmlToJs(fs.readFileSync(cPath, 'utf8')),
                                'utf8');
                        }

                        // del file
                        if (!item.match(/.[css|js|png|woff|htm|html]$/)) {
                            file.rm(cPath);
                        }

                        // wrapJs
                        if (item.match(/.js$/)) {
                            _pri.wrapJs(path.normalize(cPath));
                        }

                        // procss css
                        if (item.match(/.css$/)) {
                            _pri.proCss(path.normalize(cPath), resURL, resVer);
                        }
                    }
                });
            }
            walk(mpath.buildResource);

            // 创建必备目录
            (function () {
                if (!fs.existsSync(mpath.buildResource + 'data')) {
                    fs.mkdirSync(mpath.buildResource + 'data');
                }
            }());

            // copy mdev.plugin
            file.cpdir(path.resolve(mpath.mdevPlugin), path.resolve(mpath.buildResource + 'mdev.plugin/'));

            // async file
            _pri.buildAsyncFile(resURL, resVer, renderMode);
        };

        _pub['build'] = function (renderMode) {
            if (renderMode === 'test' || renderMode === 'debug-ie') {
                _pri.merge();
            }
            if (renderMode === 'online') {
                _pri.merge();
                _pri.min();
            }
        };

        _pub['proCss'] = function () {
            _pri.proCss.apply(this, arguments);
        };

        _pub['wrapJs'] = function () {
            _pri.wrapJs.apply(this, arguments);
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
    new require('nodejs-console')('compiler.resource'),
    require('seajs-builder')
);

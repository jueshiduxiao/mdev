module.exports = (function (fs, path, console) {
    var _pub_static = function () {
        var _pri = {};
        var _pub = {};

        var _init = function () {
            _pub.globalCxt = _pri.getGlobalContext();
            _pub.compile();
            //console.log('init.');
        };

        _pri['getGlobalContext'] = function () {
            var mpath = require('./path.js');
            var vmHelper = require('./plugin/velocity.helper.js');
            var globalTemplate = vmHelper.getTemplate(mpath.srcGlobalConf);
            var globalVars = vmHelper.getContext(globalTemplate);

            return globalVars;
        };

        _pri['compileLayout'] = function (name, path) {
            var vmHelper = require('./plugin/velocity.helper.js');
            var html = vmHelper.getTemplate(path + '/' + name + '.html');

            // res
            var resource = vmHelper.getContext(html).resource || {};
            var cssList = resource.css || [];
            var jsList = resource.js || [];
            cssList.forEach(function (val, i) {
                if (val.match(/^.\//)) {
                    cssList[i] = cssList[i].replace('./', 'layout/' + name + '/');
                }
            });
            jsList.forEach(function (val, i) {
                if (val.match(/^.\//)) {
                    jsList[i] = jsList[i].replace('./', 'layout/' + val + '/');
                }
            });

            // mods list
            var modulesList = html.match(/\s*#parseModules\(.*\)\n/g) || [];
            modulesList.forEach(function (val, i) {
                modulesList[i] = /\(\$(.*)\)/.exec(val)[1];
            });

            return  {
                name: name,
                html: html,
                cssList: cssList,
                jsList: jsList,
                modulesList: modulesList
            };
        };

        _pri['compileLayouts'] = function () {
            var mpath = require('./path.js');
            var layouts = fs.readdirSync(mpath.srcLayout);
            layouts.forEach(function (v) {
                var path = mpath.srcLayout + v;

                if (!fs.statSync(path).isDirectory()) {
                    return;
                }

                _pub.layoutsObject[v] = _pri.compileLayout(v, path);
            });
        };

        _pri['compileModule'] = function (name, path) {
            var vmHelper = require('./plugin/velocity.helper.js');
            var ret = {
                name: name,
                html: '',
                children: [],
                cssList: [],
                jsList: []
            };

            // info
            var infoPath = path + '/__info';
            var info = false;
            if (fs.existsSync(infoPath)) {
                info = true;
            }

            // html code
            if (!info) {
                ret.html = vmHelper.getTemplate(path + '/pagelet.html');
            }

            // resource
            var cssPath = path + '/' + name + '.css';
            var jsPath = path + '/' + name + '.js';
            if (fs.existsSync(cssPath)) {
                ret.cssList = [ 'module/' + name + '/' + name ];
            }
            if (fs.existsSync(jsPath)) {
                ret.jsList = [ 'module/' + name + '/' + name ];
            }


            var reg  = /\s#parseTmpl\(.*\)/g;
            var parseTmpl = function (ret) {
                var tmpls = ret.html.match(reg);
                if (!tmpls) {
                    return;
                }

                tmpls.forEach(function (val, i) {
                    var reg = /\(["|'](.*)["|']\)/;
                    var tmplName = reg.exec(val)[1];
                    var mpath = require('./path.js');
                    var tmplPath = mpath.src + tmplName;
                    var tmpl = fs.readFileSync(tmplPath, 'utf8');
                    ret.html = ret.html.replace(val, '\n\n' + tmpl + '\n\n');
                });
            };

            while(ret.html.match(reg)) {
                parseTmpl(ret);
            }

            // child modules
            var reg = /\s#parseModule\(.*\)/g;
            var childModules = ret.html.match(reg);
            if (!childModules) {
                return ret;
            }
            childModules.forEach(function (val, i) {
                var mpath = require('./path.js');
                var reg = /\(["|'](.*)["|']\)/;
                var childName = reg.exec(val)[1];
                var childPath = mpath.srcModule + childName;
                var child = _pri.compileModule(childName, childPath);
                ret.html = ret.html.replace(val, '\n\n' + child.html + '\n\n');
                ret.children.push(child.name);
                ret.children = ret.children.concat(child.children);
                ret.cssList = ret.cssList.concat(child.cssList);
                ret.jsList = ret.jsList.concat(child.jsList);
            });

            return ret;
        };


        _pri['compileModules'] = function () {
            var mpath = require('./path.js');
            var modules = fs.readdirSync(mpath.srcModule);
            modules.forEach(function (v) {
                var path = mpath.srcModule + v;
                if (!fs.statSync(path).isDirectory()) {
                    return;
                }
                _pub.modulesObject[v] = _pri.compileModule(v, path);
            });
        };

        _pri['compilePages'] = function () {
            var mpath = require('./path.js');
            var pages = fs.readdirSync(mpath.srcPage);
            pages.forEach(function (v) {
                var re = v.match(/.conf$/);

                if (!re) {
                    return;
                }

                var name = v.substring(0, re.index);
                var path = mpath.srcPage + v;
                var vmHelper = require('./plugin/velocity.helper.js');
                var conf = vmHelper.getContext(vmHelper.getTemplate(path));
                _pub.pagesObject[name] = conf;
            });
        };

        _pub['compile'] = function () {
            _pri.compileLayouts();
            _pri.compileModules();
            _pri.compilePages();
        };

        _pub['globalCxt'] = undefined;

        _pub['layoutsObject'] = {};

        _pub['modulesObject'] = {};

        _pub['pagesObject'] = {};

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

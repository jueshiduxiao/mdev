module.exports = (function (fs, path, console) {
    var _pub_static = function () {
        var _pri = {};
        var _pub = {};

        var _init = function () {
            //console.log('init.');
        };

        _pri['projectCxt'] = undefined;

        _pri['getPageContext'] = function (name) {
            var underscore = require('./plugin/underscore.v1.4.4.min.js');
            var compiler = require('./compiler.js');
            var resourceURL = _pri.projectCxt.resourceURL;
            var resourceVersion = _pri.projectCxt.resourceVersion;
            var pageVars = underscore.extend({}, compiler.globalCxt, compiler.pagesObject[name]);

            // name
            pageVars.pageName = name;

            // module resource
            var macro = '#macro(parseModules $modulesHtml)\n$modulesHtml\n#end';
            var pageModules = {};
            var layout = compiler.layoutsObject[pageVars.layout];
            var cssList = layout.cssList;
            var jsList = layout.jsList;
            var modsCount = {};
            layout.modulesList.forEach(function (modulesName) {
                var modules = pageVars[modulesName];
                pageModules[modulesName] = '';
                
                if (modules && modules.length) {
                    modules.forEach(function (moduleName) {
                        var module = compiler.modulesObject[moduleName];
                        if (!module) {
                            console.error('页面 ' + name + ' 引入了不存在的模块 ' + moduleName + '.');
                            return;
                        }
                        modsCount[moduleName] = modsCount[moduleName] || 1;
                        pageModules[modulesName] += '#if($' + moduleName + '-list.size() > ' + (modsCount[moduleName] - 1) + ')\n';
                        pageModules[modulesName] += '    #set($' + moduleName + ' = $' + moduleName + '-list[' + (modsCount[moduleName] - 1) + '])\n';
                        pageModules[modulesName] += '#else\n';
                        pageModules[modulesName] += '    #set($' + moduleName + ' = {})\n';
                        pageModules[modulesName] += '#end\n';
                        modsCount[moduleName]++;
                        pageModules[modulesName] += module.html;
                        cssList = cssList.concat(module.cssList);
                        jsList = jsList.concat(module.jsList);
                    });
                }
            });

            var vmHelper = require('./plugin/velocity.helper.js');
            var util = require('./plugin/util.js');
            pageVars.mainHtml = vmHelper.render(macro + layout.html, pageModules);
            pageVars.moduleCss = pageVars.moduleCss.concat(cssList);
            pageVars.moduleJs = pageVars.moduleJs.concat(jsList);
            pageVars.moduleCss = util.unique(pageVars.moduleCss);
            pageVars.moduleJs = util.unique(pageVars.moduleJs);
            pageVars.moduleJs.unshift('mdev.plugin/async');

            // process html imageURI
            var proRes = require('./process.resource.js');
            pageVars.mainHtml = proRes.proImageUrl(pageVars.mainHtml, resourceURL, resourceVersion);

            // push page data
            var mpath = require('./path.js');
            var dataPage = '';
            if (fs.existsSync(mpath.srcData + 'data-' + name + '.vm')) {
                dataPage = fs.readFileSync(mpath.srcData + 'data-' + name + '.vm', 'utf8');
                dataPage = dataPage.replace(/\$!{resourceURL}/g, resourceURL);
                dataPage = dataPage.replace(/\$!{resourceVersion}/g, resourceVersion);
            }
            pageVars.mainHtml = dataPage + pageVars.mainHtml;
            pageVars.mainHtml = '#set($resourceURL = "' + resourceURL + '")\n' + pageVars.mainHtml;

            return pageVars;
        };

        _pri['createGlobalResFile'] = function (pageVars, resourceURL) {
            var globalCss = pageVars.globalCss || [];
            var globalJs = pageVars.globalJs || [];
            if (globalCss.length === 0 && globalJs.length === 0) {
                globalCss = require('./global.resource.js').globalCss;
                globalJs = require('./global.resource.js').globalJs;
            }

            var mpath = require('./path.js');
            var proRes = require('./process.resource.js');
            var buildPath = mpath.buildResource + 'build/';

            // create dir
            if (!fs.existsSync(buildPath)) {
                fs.mkdirSync(buildPath);
            }

            var toPath, content;

            // global css
            toPath = path.resolve(buildPath + 'global.css');
            content = '';
            globalCss.forEach(function (v) {
                content += '@import "/' + v + '.css";' + '\r\n';
            });
            content = proRes.proCssUrl(content, resourceURL);
            fs.writeFileSync(toPath, content, 'utf8');

            // global js
            toPath = path.resolve(buildPath + 'global.js');
            content = '';
            globalJs.forEach(function (v) {
                content += 'document.write(\'<script type="text/javascript" src="/' + v + '.js"></script>\');' + '\r\n';
            });
            content = proRes.proJsUrl(content, resourceURL);
            fs.writeFileSync(toPath, content, 'utf8');
        };

        _pri['createPageResFile'] = function (pageVars, resourceURL) {
            var mpath = require('./path.js');
            var vmHelper = require('./plugin/velocity.helper.js');
            var proRes = require('./process.resource.js');
            var buildPath = mpath.buildResource + 'build/';

            // create dir
            if (!fs.existsSync(buildPath)) {
                fs.mkdirSync(buildPath);
            }

            var toPath, content;

            // page css
            toPath = path.resolve(buildPath + pageVars.pageName + '.css');
            content = '';
            pageVars.moduleCss.forEach(function (v) {
                content += '@import "/' + v + '.css";' + '\r\n';
            });
            content = proRes.proCssUrl(content, resourceURL);
            fs.writeFileSync(toPath, content, 'utf8');

            // page js
            var tmpl = vmHelper.getTemplate(mpath.tmplReq);
            var content = vmHelper.render(tmpl, pageVars);
            toPath = path.resolve(buildPath + pageVars.pageName + '.js');
            fs.writeFileSync(toPath, content, 'utf8');
        };

        _pri['output'] = function () {
            var mpath = require('./path.js');
            var tool = require('nodejs-tools');
            var underscore = require('./plugin/underscore.v1.4.4.min.js');
            var vmHelper = require('./plugin/velocity.helper.js');
            var projectCxt = _pri.projectCxt;
            var cssTemplate = vmHelper.getTemplate(mpath.tmplCss);
            var jsTemplate = vmHelper.getTemplate(mpath.tmplJs);
            var htmlTemplate = vmHelper.getTemplate(mpath.srcTemplate);

            // output page
            var page, pageVars, pageFrame, tmplContext;
            var compiler = require('./compiler.js');
            for (page in compiler.pagesObject) {
                pageVars = _pri.getPageContext(page);
                tmplContext = underscore.extend(pageVars, projectCxt);

                if (projectCxt.pageRender === 'server') {
                    pageVars.resourceCss = vmHelper.render(cssTemplate, tmplContext);
                    pageVars.resourceJs = vmHelper.render(jsTemplate, tmplContext);
                    pageFrame = vmHelper.render(htmlTemplate, pageVars);
                    fs.writeFileSync(mpath.buildPage + page + '.vm', pageFrame, 'utf8');
                }

                if (projectCxt.pageRender === 'client') {
                    (function () {
                        var dataJs = mpath.buildResource + 'data/data-' + page + '.js';
                        if (fs.existsSync(dataJs)) {
                            return;
                        }

                        var code = '\
                            define(function (require, exports, module) {\
                                var $$tmpl = require(\'./tmpl-' + page + '.js\');\
                                var html = mdev.tmpl($$tmpl, {});\
                                mdev.dom.prepend(html);\
                            });\
                        ';
                        fs.writeFileSync(dataJs, code, 'utf8');
                    }());

                    pageVars.moduleJs.push('data/data-' + page + '.js');
                    pageVars.mainHtml = tool.htmlToJs(pageVars.mainHtml);
                    fs.writeFileSync(mpath.buildResource + 'data/tmpl-' + page + '.js', pageVars.mainHtml, 'utf8');
                    pageVars.mainHtml = '';

                    pageVars.resourceCss = vmHelper.render(cssTemplate, tmplContext);
                    pageVars.resourceJs = vmHelper.render(jsTemplate, tmplContext);
                    pageFrame = vmHelper.render(htmlTemplate, pageVars);
                    fs.writeFileSync(mpath.buildPage + page + '.html', pageFrame, 'utf8');
                }

                _pri.createPageResFile(pageVars, projectCxt.resourceURL);
            }

            _pri.createGlobalResFile(pageVars, projectCxt.resourceURL);
        };

        _pub['run'] = function (proCxt) {
            _pri.projectCxt = proCxt;
            _pri.output();
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
    new require('nodejs-console')('compiler.output.nor')
);

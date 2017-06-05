module.exports = (function (fs, path, console) {
    var _pub_static = function () {
        var _pri = {};
        var _pub = {};

        var _init = function () {
            //console.log('init.');
        };

        _pri['projectCxt'] = undefined;

        _pri['createGlobalResFile'] = function (resourceURL) {
            var globalRes = require('./global.resource.js');
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
            globalRes.globalCss.forEach(function (v) {
                content += '@import "/' + v + '.css";' + '\r\n';
            });
            content = proRes.proCssUrl(content, resourceURL);
            fs.writeFileSync(toPath, content, 'utf8');

            // global js
            toPath = path.resolve(buildPath + 'global.js');
            content = '';
            globalRes.globalJs.forEach(function (v) {
                content += 'document.write(\'<script type="text/javascript" src="/' + v + '.js"></script>\');' + '\r\n';
            });
            content = proRes.proJsUrl(content, resourceURL);
            fs.writeFileSync(toPath, content, 'utf8');
        };

        _pri['getPageContext'] = function (name) {
            var cpath = require('./path.js');
            var tool = require('nodejs-tools');
            var underscore = require('./plugin/underscore.v1.4.4.min.js');
            var compiler = require('./compiler.js');
            var proRes = require('./process.resource.js');
            var vmHelper = require('./plugin/velocity.helper.js');
            var tmplMod = vmHelper.getTemplate(cpath.tmplBpModule);
            var pageVars = underscore.extend({}, compiler.globalCxt, compiler.pagesObject[name]);

            // name
            pageVars.pageName = name;

            // parseModules and layout
            var macro = '#macro(parseModules $modulesHtml)\n$modulesHtml#end';
            var pageModules = {};
            var layout = compiler.layoutsObject[pageVars.layout];
            var layoutInfo = {};
            layout.modulesList.forEach(function (modulesName) {
                pageModules[modulesName] = '<div id="' + modulesName + '"></div>';
            });
            layoutInfo = {
                resourceURL: _pri.projectCxt.resourceURL,
                jsList: layout.jsList.concat([ 'mdev.plugin/async' ]),
                cssList: layout.cssList.concat(compiler.globalCxt.moduleCss)
            };
            console.log(layoutInfo.jsList);
            pageVars.mainHtml = vmHelper.render(tmplMod, layoutInfo);
            pageVars.mainHtml += vmHelper.render(macro + layout.html, pageModules);

            // modules
            layout.modulesList.forEach(function (modulesName) {
                var modules = pageVars[modulesName];
                var modsCount = {};
                modules.forEach(function (moduleName) {
                    var module = compiler.modulesObject[moduleName];
                    modsCount[moduleName] = modsCount[moduleName] || 1;
                    pageVars.mainHtml += '\n\n#set($' + moduleName + ' = $' + moduleName + '-list[' + (modsCount[moduleName] - 1) + '])';
                    var html = proRes.proImageUrl(module.html, _pri.projectCxt.resourceURL, _pri.projectCxt.resourceVersion);

                    var moduleInfo = {
                        resourceURL: _pri.projectCxt.resourceURL,
                        jsList: module.jsList,
                        cssList: module.cssList,
                        html: tool.htmlToString(html),
                        parent: modulesName
                    };
                    pageVars.mainHtml += vmHelper.render(tmplMod, moduleInfo);
                    modsCount[moduleName]++;
                });
            });

            // process html imageURI

            // push page data
            var mpath = require('./path.js');
            var dataPage = fs.readFileSync(mpath.srcData + 'data-' + name + '.vm', 'utf8');
            dataPage = dataPage.replace(/\$!{resourceURL}/g, _pri.projectCxt.resourceURL);
            dataPage = dataPage.replace(/\$!{resourceVersion}/g, _pri.projectCxt.resourceVersion);
            pageVars.mainHtml = dataPage + pageVars.mainHtml;

            return pageVars;
        };

        _pri['output'] = function () {
            var mpath = require('./path.js');
            var underscore = require('./plugin/underscore.v1.4.4.min.js');
            var vmHelper = require('./plugin/velocity.helper.js');
            var projectCxt = _pri.projectCxt;
            var htmlTemplate = vmHelper.getTemplate(mpath.tmplBpTemplate);

            // output page
            var page, pageVars, pageFrame, tmplContext;
            var compiler = require('./compiler.js');
            for (page in compiler.pagesObject) {
                pageVars = _pri.getPageContext(page);
                tmplContext = underscore.extend(pageVars, projectCxt);
                pageFrame = vmHelper.render(htmlTemplate, pageVars);
                fs.writeFileSync(mpath.buildPage + page + '.vm', pageFrame, 'utf8');
            }

            _pri.createGlobalResFile(projectCxt.resourceURL);
        };

        _pub['run'] = function (proCxt) {
            _pri.projectCxt = proCxt;
            _pri.output();
            console.log('output page ...');
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
    console,
    new require('nodejs-console')('compiler.output.bp')
);

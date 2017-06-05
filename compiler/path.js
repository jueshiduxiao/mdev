var path = require('path');
var underscore = require('./plugin/underscore.v1.4.4.min.js');

var mpath = {
    mdev           : '/__compile/',
    mdevPlugin     : '/__compile/mdev.plugin/',
    tmplCss        : '/__compile/compiler/tmpl/exports.css.tpl',
    tmplJs         : '/__compile/compiler/tmpl/exports.js.tpl',
    tmplReq        : '/__compile/compiler/tmpl/seajs.define.tpl',
    tmplJsPack     : '/__compile/compiler/tmpl/wrapper.js.tpl',
    tmplBpTemplate : '/__compile/compiler/tmpl/bp.template.tpl',
    tmplBpModule   : '/__compile/compiler/tmpl/bp.module.tpl',
    build          : '/__build/',
    buildPage      : '/__build/page/',
    buildResource  : '/__build/resource/',
    src            : '/src/',
    srcLayout      : '/src/layout/',
    srcModule      : '/src/module/',
    srcPage        : '/src/page/',
    srcData        : '/src/data/',
    srcCss         : '/src/css/',
    srcScript      : '/src/script/',
    srcImage       : '/src/image/',
    srcGlobalConf  : '/src/conf/global_variable.conf',
    srcProjectConf : '/src/conf/project.conf',
    srcTemplate    : '/src/layout/template.html'
}

// format path
var pmdev = path.normalize(path.dirname(__dirname)) + '/';
var psrc = './src/';
var pbuild = './build/';
underscore.each(mpath, function (val, key) {
    if (val.match(/^\/__compile\//)) {
        mpath[key] = val.replace('/__compile/', pmdev);
        return;
    }

    if (val.match(/^\/src\//)) {
        mpath[key] = val.replace('/src/', psrc);
        return;
    }

    if (val.match(/^\/__build\//)) {
        mpath[key] = val.replace('/__build/', pbuild);
        return;
    }
});

module.exports = mpath;

var fs = require('fs');
var velocity = require('velocityjs');

function clearCode(code) {
    // \r\n
    code = code.replace(/\r\n/g, '\n');

    // \t
    code = code.replace(/\t/g, '    ');

    // ##
    code = code.replace(/##.*/g, '');

    // #**#
    code = code.replace(/#\*(.*\n)*\*#/g, '');

    // Line End Space
    code = code.replace(/ +\n/g, '\n');

    // more \n
    code = code.replace(/\n{2,}/g, '\n\n');

    // head and end \n
    code = code.replace(/^\n+/g, '');
    code = code.replace(/\n+$/g, '\n');

    return code;
}

function processParse(code) {
    // clear
    code = clearCode(code);

    // parse
    var parseReg = /[\n | ]+#parse\(.*\)/g;
    var parseList = code.match(parseReg);
    var parseStartReg = /^#parse\(.*\)/;
    var parseStart = code.match(parseStartReg);

    if (parseStart) {
        parseList = parseList || [];
        parseList.unshift(parseStart[0]);
    }

    if (!parseList) {
        return code;
    }

    parseList.forEach(function (val, i) {
        var pathReg = /['|"](.*)['|"]/;
        var path = pathReg.exec(val)[1];
        var parseCode = fs.readFileSync(path, 'utf8');
        var space = val.match(/ /g) || [];
        var space = space.join('');

        // 处理缩进
        parseCode = clearCode(parseCode);
        parseCode = parseCode.replace(/\n/g, '\n' + space);
        parseCode = '\n\n' + space + parseCode + '\n\n';

        code = code.replace(val, parseCode);
    });
    return processParse(code);
}

function getContext(vmString) {
    var ast = velocity.Parser.parse(vmString);
    var makeup = new velocity.Helper.Structure(ast);
    return makeup.context;
}

function getTemplate(path) {
    var html = fs.readFileSync(path, 'utf8');
    html = vmHelper.clearCode(html);
    html = vmHelper.processParse(html);
    html = vmHelper.clearCode(html);
    return html;
}

var vmHelper = {
    clearCode: clearCode,
    processParse: processParse,
    getContext: getContext,
    getTemplate: getTemplate,
    render: velocity.render
};

exports = module.exports = vmHelper;

module.exports = (function (fs, path, console) {
    var _pub_static = function () {
        var _pri = {};
        var _pub = {};

        var _init = function () {
        };

        _pri['pro'] = {};

        _pri['formatResUrl'] = function (resUrl) {
            if (resUrl.match(/[\/|\\]$/)) {
                return resUrl.substring(0, resUrl.length - 1);
            }

            return resUrl;
        };

        // <img src=""
        _pub['proImageUrl'] = function (html, resUrl, resVer) {
            var ret;

            // process /
            resUrl = _pri.formatResUrl(resUrl);

            var reg = /<[i|I][m|M][g|G]\s((.|\s)*?)>/g;
            ret = html.replace(reg, function (v0, v1) {
                var match = v0;
                var pros = v1;
                var reg = /src=['|"](.*?)['|"]/;
                var nPros;

                nPros = pros.replace(reg, function (v0, v1) {
                    var match = v0;
                    var url = v1;

                    if (!url.match(/^[\/|\\]/)) {
                        return match;
                    }
                    return match.replace(url, resUrl + url + '?' + resVer);
                });

                return match.replace(pros, nPros);
            });

            return ret;
        };

        // @import ""
        _pub['proCssUrl'] = function (css, resUrl) {
            var ret;

            // process /
            resUrl = _pri.formatResUrl(resUrl);

            var reg = /@[i|I][m|M][p|P][o|O][r|R][t|T]\s*['|"](.*?)['|"];/g;

            ret = css.replace(reg, function (v0, v1) {
                var match = v0;
                var url = v1;

                if (!url.match(/^[\\|\/]/)) {
                    return match;
                }

                var ret = match.replace(url, resUrl + url);
                ret += '/*[import]' + url + '[/import]*/';

                return ret;
            });

            return ret;
        };

        // document.write('<script type="text/javascript" src=""></script>');
        _pub['proJsUrl'] = function (script, resUrl) {
            var ret;

            // process /
            resUrl = _pri.formatResUrl(resUrl);

            var reg = /document.write\('<script.*?src="(.*?)".*?><\/script>'\);/g;

            ret = script.replace(reg, function (v0, v1) {
                var match = v0;
                var url = v1;

                if (!url.match(/^[\\|\/]/)) {
                    return match;
                }

                var ret = match.replace(url, resUrl + url);
                ret += '/*[import]' + url + '[/import]*/';

                return ret;
            });

            return ret;
        };

        // background: url("")
        _pub['proCssImgUrl'] = function (css, resUrl, resVer) {
            var ret;

            // process /
            resUrl = _pri.formatResUrl(resUrl);

            var reg = /[u|U][r|R][l|L]\('(.*?)'\)/g;

            ret = css.replace(reg, function (v0, v1) {
                var match = v0;
                var url = v1;

                if (!url.match(/^[\\|\/]/)) {
                    return match;
                }
                return match.replace(url, resUrl + url + '?' + resVer);
            });

            return ret;
        };

        // build css
        _pri['buildCss'] = function (css, resDir) {
            var ret;

            var reg = /@[i|I][m|M][p|P][o|O][r|R][t|T]\s*.*\/\*\[import\](.*?)\[\/import\]\*\//g;
            var eMap = {};
            ret = css.replace(reg, function (v0, v1) {
                var match = v0;
                var url = v1;

                if (eMap[url]) {
                    return '';
                }

                eMap[url] = true;

                var content = fs.readFileSync(resDir + url, 'utf8');

                return content;
            });

            return ret;
        };

        _pub['buildCssFile'] = function (from, resourceDir, to) {
            var code = fs.readFileSync(from, 'utf8');
            code = _pri.buildCss(code, resourceDir);
            fs.writeFileSync(to, code, 'utf8');
        };

        // build js
        _pri['buildJs'] = function (code, resDir) {
            var ret;

            var reg = /document.write\('<script.*?src=".*?".*?><\/script>'\);\/\*\[import\](.*?)\[\/import\]\*\//g;
            ret = code.replace(reg, function (v0, v1) {
                var match = v0;
                var url = v1;

                var content = fs.readFileSync(resDir + url, 'utf8');

                return content;
            });

            return ret;
        };

        _pub['buildJsFile'] = function (from, resourceDir, to) {
            var code = fs.readFileSync(from, 'utf8');
            code = _pri.buildJs(code, resourceDir);
            fs.writeFileSync(to, code, 'utf8');
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
    new require('nodejs-console')('process.resource')
);

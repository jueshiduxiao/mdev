module.exports = (function (fs, path, optimist, nconsole) {
    var _pub_static = function () {
        var _pri = {};
        var _pub = {};

        var _init = function () {
        };

        _pri['menu'] = {
            commands: {
                build: {
                    describe: 'build the project',
                    options: {
                        watch: {
                            alias: 'w',
                            describe: 'monitor the changes of project'
                        },
                        help: {
                            alias: 'h',
                            describe: 'output usage information'
                        }
                    }
                },
                'start': {
                    describe: 'start the local server',
                    options: {
                        port: {
                            alias: 'p',
                            describe: 'set the port of the local server'
                        },
                        help: {
                            alias: 'h',
                            describe: 'output usage information'
                        }
                    }
                }
            },
            options: {
                version: {
                    alias: 'v',
                    describe: 'output the version number'
                },
                help: {
                    alias: 'h',
                    describe: 'output usage information'
                }
            }
        };

        _pri['showHelp'] = function (name, data) {
            var content = [];

            if (name !== '') {
                content = content.concat([
                    '',
                    '  Usage: ' + name,
                    ''
                ]);
            }

            if (data.commands) {
                content = content.concat([
                    '  Commands:',
                    ''
                ]);
                (function () {
                    var s, k, v, i;
                    for (var k in data.commands) {
                        v = data.commands[k];
                        s = '';
                        for (i = 0; i < 8 + 6 - k.length; i++) {
                            s += ' ';
                        }
                        content.push('    ' + k + s + v.describe);
                    }
                }());
                content.push('');
            }

            if (data.options) {
                content = content.concat([
                    '  Options:',
                    ''
                ]);
                (function () {
                    var s, k, v, i;
                    for (var k in data.options) {
                        v = data.options[k];
                        s = '';
                        for (i = 0; i < 8 - k.length; i++) {
                            s += ' ';
                        }
                        content.push('    -' + v.alias + ', --' + k + s + v.describe);
                    }
                }());
            }

            console.log(content.join('\n'));
        };

        _pri['showError'] = function (name) {
            var content = [
                '',
                '  Error:',
                '',
                '    The \'' + name + '\' is not a command.',
                '    See \'mdev --help\'.'
            ];

            console.log(content.join('\n'));
        };

        _pri['showVersion'] = function () {
            var p = require('./package.json');
            var content = [
                '',
                '  Version: ' + p.version,
                '',
                '    By lx 2013-2017.',
                '    The more commands see \'mdev --help\'.'
            ];

            console.log(content.join('\n'));
        };

        _pub['run'] = function () {
            var args = optimist.argv;
            var menu = _pri.menu;

            // version
            if (args.v || args.version) {
                _pri.showVersion();
                return;
            }

            // help
            if (args._.length === 0) {
                _pri.showHelp('mdev', menu);
                return;
            }

            var command = args._[0];
            if (!menu.commands[command]) {
                _pri.showError(command);
                return;
            } else {
                if (args.h || args.help) {
                    _pri.showHelp(command, menu.commands[command]);
                    return;
                }

                var compiler = require('./compiler/main.js');

                if (command === 'build') {
                    if (args.w || args.watch) {
                        compiler.buildWatch();
                    } else {
                        compiler.build();
                    }
                    return;
                }

                if (command === 'start') {
                    var root = compiler.buildDir;
                    var port = args.p || args.port || 3000;
                    if (!(port >= 1 && port <= 65535)) {
                        port === 3000;
                    }
                    var nserver = new require('nodejs-server')(root, port);
                    nserver.config({
                        velocity: true,
                        velocityTmplDir: root + 'page/',
                        velocityContextDir: root + 'test/page/'
                    });
                    nserver.config({
                        proxy: true
                    });
                    nserver.config({
                        allowExtension: [ '.woff', '.eot', '.cur', '.map', '.png', '.txt', '.swf' ]
                    });

                    var fs = require('fs');
                    var proxyConfig = require('./compiler/path.js').src + 'conf/proxy.conf';
                    if (fs.existsSync(proxyConfig)) {
                        proxyConfig = fs.readFileSync(proxyConfig, 'utf8');
                        proxyConfig = JSON.parse(proxyConfig);
                        nserver.config({
                            proxyList: proxyConfig
                        });
                    }

                    nserver.start();
                    nconsole.log('server running on port ' + port + '.');
                    return;
                }
            }
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
    require('optimist'),
    new require('nodejs-console')('mdev')
);


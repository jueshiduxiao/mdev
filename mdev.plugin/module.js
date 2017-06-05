/*jslint browser: true, vars: true, nomen: true, indent: 4, maxlen: 80, plusplus: true, sloppy: true*/

/**
 * @author liangxiao
 * @version [v1.0]
 * @description
 */

(function (win, $, mdev) {
    var builders = {};
    var buildTimer;
    var map = {};
    var msgList = [];
    var initModulesReady = false;

    function trigger(channels) {
        var modules = channels.split(',');
        var args = [].slice.call(arguments, 1);

        modules.forEach(function (_channel) {
            var channel = _channel.trim();
            var handlers = map[channel] || [];
            var i;
            for (i = 0; i < handlers.length; i++) {
                handlers[i].apply(undefined, args);
            }
        });
    }

    function triggerForce(channels) {
        if (!initModulesReady) {
            msgList.push({
                args: [].slice.call(arguments)
            });
            return;
        }

        if (channels === 'mdev:modulesReady') {
            msgList.forEach(function (msg) {
                triggerForce.apply(undefined, msg.args);
            });
            return;
        }

        var modules = channels.split(',');
        var args = [].slice.call(arguments, 1);

        modules.forEach(function (_channel) {
            var channel = _channel.trim();

            // module loaded, trigger only
            if (mdev.modules.indexOf(channel) >= 0) {
                trigger.apply(undefined, [ channel ].concat(args));
                return;
            }

            // async load module and trigger
            if (!mdev || !mdev.asyncLoadModule) {
                console.warn('[mdev] can\'t find \'mdev.asyncLoadModule\' method.');
                return;
            }
            mdev.asyncLoadModule(channel, function () {
                trigger.apply(undefined, [ channel ].concat(args));
            });
        });
    }

    function listen(channel, handler) {
        var handlers = map[channel] || [];
        handlers.push(handler);
        map[channel] = handlers;
    }

    function buildModule(selector, handlers) {
        var $modules = $(selector);

        $.each($modules, function (index) {
            var $module = $modules.eq(index);
            if ($module.data('is-build') === true) {
                return;
            }

            handlers.forEach(function (handler) {
                handler($module);
            });

            $module.data('is-build', true);
        });
    }

    function buildModules() {
        win.clearTimeout(buildTimer);
        buildTimer = win.setTimeout(function () {
            var selector;
            for (selector in builders) {
                if (builders.hasOwnProperty(selector)) {
                    buildModule(selector, builders[selector]);
                }
            }

            // initModulesReady
            if (!initModulesReady) {
                initModulesReady = true;
                mdev.message.triggerForce('mdev:modulesReady');
            }
        }, 50);
    }

    function build(selector, handler) {
        if (typeof selector === 'string' && typeof handler === 'function' &&
                selector.length !== 0) {
            builders[selector] = builders[selector] || [];
            builders[selector].push(handler);
        }

        buildModules();
    }

    var module = {
        build: build,
        getInstance: function (selector, fn) {
            var $modules = $(selector);

            $.each($modules, function (index) {
                var $module = $modules.eq(index);
                if (typeof fn === 'function') {
                    fn($module);
                }
            });
        },
        prepend: function (html) {
            if (typeof html !== 'string') {
                throw 'error args !';
            }

            $(document.body).prepend($(html));
            build();
        },
        append: function (html) {
            if (typeof html !== 'string') {
                throw 'error args !';
            }

            $(document.body).append($(html));
            build();
        },
        dialog: (function () {
            function showDialog(html, call) {
                if (typeof html !== 'string') {
                    throw 'error args !';
                }

                $.fancybox({
                    overlayOpacity : 0.5,
                    overlayColor : '#000',
                    content: html,
                    onComplete: function () {
                        if (typeof call === 'function') {
                            call();
                        }
                    }
                });
            }

            // close
            showDialog.close = function () {
                $.fancybox.close();
            };

            // alert
            showDialog.alert = function (msg, call) {
                win.alert(msg);

                if (typeof call === 'function') {
                    call();
                }
            };

            return showDialog;
        }())
    };

    mdev = mdev || {};
    mdev.modules = [];
    mdev.dom = module;
    mdev.message = {
        trigger: trigger,
        triggerForce: triggerForce,
        listen: listen
    };
}(
    window,
    window.jQuery,
    window.mdev
));

#macro(exportsSeaJs)
    <script type="text/javascript" src="${resourceURL}mdev.plugin/sea.v1.0.1.js"></script>
    <script type="text/javascript">
        seajs.config({
            base: '${resourceURL}',
            charset: 'utf-8',
            timeout: 1000,
            debug: 0
        });
        seajs.use([
            "build/${pageName}"
        ]);
    </script>
#end

#if($renderMode == 'debug')
    <script type="text/javascript" src="${resourceURL}build/global.js"></script>
    #exportsSeaJs()
#end

#if($renderMode == 'debug-ie')
    <script type="text/javascript" src="${resourceURL}build/global.js"></script>
    #exportsSeaJs()
#end

#if($renderMode == 'test')
    <script type="text/javascript" src="${resourceURL}build/global.merge.js?${resourceVersion}"></script>
    <script type="text/javascript" src="${resourceURL}build/${pageName}.merge.js?${resourceVersion}"></script>
#end

#if($renderMode == 'online')
    <script type="text/javascript" src="${resourceURL}build/global.min.js?${resourceVersion}"></script>
    <script type="text/javascript" src="${resourceURL}build/${pageName}.min.js?${resourceVersion}"></script>
#end

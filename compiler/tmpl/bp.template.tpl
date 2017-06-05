<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="keywords" content="${keywords}" />
<meta name="description" content="${description}" />
<title>${title} - ${product}</title>

<!-- export global resource  -->
#if($renderMode == 'online')
    <link rel="stylesheet" href="${resourceURL}build/global.min.css?${resourceVersion}" />
    <script type="text/javascript" src="${resourceURL}build/global.min.js?${resourceVersion}"></script>
#end

#if($renderMode == 'test')
    <link rel="stylesheet" href="${resourceURL}build/global.merge.css?${resourceVersion}" />
    <script type="text/javascript" src="${resourceURL}build/global.merge.js?${resourceVersion}"></script>
#end

#if($renderMode == 'debug' || $renderMode == 'debug-ie')
    <link rel="stylesheet" href="${resourceURL}build/global.css" />
    <script type="text/javascript" src="${resourceURL}build/global.js"></script>
    <script type="text/javascript" src="${resourceURL}mdev.plugin/sea.v1.0.1.js"></script>
    <script type="text/javascript">
        seajs.config({
            base: '${resourceURL}',
            charset: 'utf-8',
            timeout: 1000,
            debug: 0
        });
    </script>
#end

</head>
<body data-page-name="${pageName}">

<!-- layout -->
${mainHtml}

</body>
</html>

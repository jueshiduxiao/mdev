#if($renderMode == 'online')
    <link rel="stylesheet" href="${resourceURL}build/global.min.css?${resourceVersion}" />
    <link rel="stylesheet" href="${resourceURL}build/${pageName}.min.css?${resourceVersion}" />
#end

#if($renderMode == 'test')
    <link rel="stylesheet" href="${resourceURL}build/global.merge.css?${resourceVersion}" />
    <link rel="stylesheet" href="${resourceURL}build/${pageName}.merge.css?${resourceVersion}" />
#end

#if($renderMode == 'debug')
    <link rel="stylesheet" href="${resourceURL}build/global.css" />
    <link rel="stylesheet" href="${resourceURL}build/${pageName}.css" />
#end

#if($renderMode == 'debug-ie')
    <link rel="stylesheet" href="${resourceURL}build/global.merge.css" />
    <link rel="stylesheet" href="${resourceURL}build/${pageName}.merge.css" />
#end

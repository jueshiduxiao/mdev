#if($cssList.size() > 0)
    #foreach($css in $cssList)
        <link rel="stylesheet" href="${resourceURL}${css}.css" />
    #end
#end


#if($html)
    <script type="text/javascript">
        jQuery("#${parent}").append("${html}");
    </script>
#end


#if($jsList.size() > 0)
<script type="text/javascript">
    seajs.use([
        #foreach($js in $jsList)
        '$js'
        #end
    ]);
</script>
#end

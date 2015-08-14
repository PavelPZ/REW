var test;
(function (test) {
    function done(id) {
        return function () {
            $('#result' + id).html('done.');
        };
    }
    function progress(id) {
        return function () {
            return $('#result' + id).html($('#result' + id).html() + '.');
        };
    }

    var promise = $.when($.noop);

    //function process(): JQueryPromise<any> {
    //  var deferred = $.Deferred();
    //  var timer = setInterval(deferred.notify, 200);
    //  setTimeout(() => { clearInterval(timer); deferred.resolve(); }, 2000);
    //  return deferred.promise();
    //}
    function process(id) {
        var deferred = $.Deferred();
        var timer = setInterval(deferred.notify, 200);
        setTimeout(function () {
            clearInterval(timer);
            deferred.resolve();
        }, 2000);
        return function () {
            return deferred.promise().progress(progress(id)).then(done(id));
        };
    }

    function processProc(id) {
        promise = promise.then(process(id));
    }

    processProc(1);
    processProc(2);
    processProc(3);
    processProc(4);
    processProc(5);

    setTimeout(function () {
        processProc(6);
        processProc(7);
    }, 12000);
})(test || (test = {}));
/*
<body>
<div id="result1"></div>
<div id="result2"></div>
<div id="result3"></div>
<div id="result4"></div>
<div id="result5"></div>
<div id="result6"></div>
<div id="result7"></div>
<div id="result8"></div>
<div id="result9"></div>
<div id="result10"></div>
<div id="result11"></div>
<div id="result12"></div>
<div id="result13"></div>
<div id="result14"></div>
<div id="result15"></div>
<div id="result16"></div>
<div id="result17"></div>
<div id="result18"></div>
<div id="result19"></div>
<div id="result20"></div>
<script type="text/javascript" src="../JsLib/Scripts/jquery.js"></script>
<script type="text/javascript" src="file1.js"></script>
</body>
</html>
*/

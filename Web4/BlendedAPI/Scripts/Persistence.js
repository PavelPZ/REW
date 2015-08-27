var blended;
(function (blended) {
    var persistence;
    (function (persistence) {
        function loadShortUserData(userId, companyId, prodUrl, completed) { }
        persistence.loadShortUserData = loadShortUserData;
        function loadUserData(userId, companyId, prodUrl, url, taskId, completed) { }
        persistence.loadUserData = loadUserData;
        function saveUserData(userId, companyId, prodUrl, data, completed) { }
        persistence.saveUserData = saveUserData;
        function resetExs(userId, companyId, prodUrl, urls, completed) { }
        persistence.resetExs = resetExs;
    })(persistence || (persistence = {}));
})(blended || (blended = {}));

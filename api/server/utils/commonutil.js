var util = (function util() {
    let utilInstance;

    function createUtils() {
        return {
            omit: function omit(obj, omitKeys) {
                return Object.keys(obj).reduce((result, key) => {
                    if (omitKeys.indexOf(key) < 0) {
                        result[key] = obj[key];
                    }
                    return result;
                }, {});
            }
        }
    }
    return {
        getInstance: function() {
            if (!utilInstance) {
                utilInstance = createUtils();
            }
            return utilInstance;
        }
    }
})()

module.exports = util;
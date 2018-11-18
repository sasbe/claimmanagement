var util = (function util() {
    let utilInstance;

    function createUtils() {
        return {
            omit: function omit(obj, omitKeys) {
                return Object.keys(obj).reduce((result, key) => {
                    if (omitKeys.indexOf(key) < 0) {
                        result.push(obj[key]);
                    }
                    return result;
                }, []);
            },
            getColumnDefinitions: function (context, obj, omitKeys) {
                var res = [];
                if (context) {
                    Object.keys(obj).reduce((result, key) => {
                        if (omitKeys.indexOf(key) < 0) {
                            let column = obj[key];
                            result.push({
                                context : context,
                                displayName: column.path,
                                type: column.instance,
                                name: column.path,
                            });
                        }
                        return result;
                    }, res);
                }
                return res;
            },
            throwError: function (res, type) {
                var error = ''
                switch (type) {
                    case 'AccessDenied':
                        error = "Oops! Access Denied"
                        break;
                    case 'RequireField':
                        error = "Please fill all the required fields"
                        break;
                    case 'AdminError':
                        error = "Server failure. Please contact the administrator"
                        break;
                    default:
                        error = type;
                        break;
                }
                return res.json({
                    success: false,
                    message: error
                });
            }
        }
    }
    return {
        getInstance: function () {
            if (!utilInstance) {
                utilInstance = createUtils();
            }
            return utilInstance;
        }
    }
})()

module.exports = util;
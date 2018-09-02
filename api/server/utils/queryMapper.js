let QueryMapper = {};

QueryMapper.getColumnName = function(tableName, query, type = "name") {
    let columns = []
    if (query[tableName]) {
        let tableColums = query[tableName].columns;
        tableColums.forEach(element => {
            columns.push(element[type]);
        });
    }
    return columns;
}
QueryMapper.buildQuery = function(query, limit, skip) {
    let queries = [{ '$skip': Number(skip || 0) }, { '$limit': Number(limit || 10) }];;
    let info = this.populateInfo(query);
    if (info.hasUsers) {
        queries.push({
            $lookup: {
                from: 'users',
                localField: 'employeeid',
                foreignField: '_id',
                as: 'users'
            }
        });
    }
    if (info.hasDependents) {
        queries.push({
            $lookup: {
                from: 'dependents',
                localField: 'dependentId',
                foreignField: '_id',
                as: 'dependents'
            }
        });

    }
    query.push({ $project: info.project });
    return queries;

}
QueryMapper.populateInfo = function(query) {
    let info = {
        project: { _id: 1 },
        hasUsers: false,
        hasDependents: false
    };
    query.forEach(element => {
        if (element.context == "users") {
            info.hasUsers = true;
            info.project["users." + element.name] = 1;
        } else if (element.context == "dependents") {
            info.hasDependents = true;
            info.project["dependents." + element.name] = 1;
        } else {
            info.project[element.name] = 1;
        }
    })
    return info;
}

module.exports = QueryMapper;
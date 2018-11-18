(function () {
    'use strict';

    angular
        .module('QueryDirective', [])
        .directive('filterCondition', ['mongoQueryFactory', '$compile', function (mongoQueryFactory, $compile) {
            return {
                link: link,
                restrict: 'E',
                scope: {
                    condition: '=',
                    table: '=',
                    schema: '=',
                },
            }
            function link(scope, elem, attrs) {
                scope.keys = function (value) {

                    return value ? Object.keys(value) : [];
                }
                var template =  '   <div>  '  + 
                '                           <div ng-switch="type">  '  + 
                '                               <div ng-switch-when="Array">  '  + 
                '                                   <div ng-repeat="qur in query">  '  + 
                '                                       <filter-condition table="table" condition="qur" schema="schema"></filter-condition>  '  + 
                '                                   </div>  '  + 
                '                               </div>  '  + 
                '                               <div ng-switch-when="$and">  '  + 
                '                                       <md-input-container>  '  + 
                '                                           <md-select ng-model="type" placeholder="Select a matcher">  '  + 
                '                                               <md-option ng-value="match" ng-repeat="match in [\'$and\',\'$or\']">{{ match }}</md-option>  '  + 
                '                                           </md-select>  '  + 
                '                                       </md-input-container>  '  + 
                '                                   <filter-condition table="table" condition="query" schema="schema"></filter-condition>  '  + 
                '                               </div>  '  + 
                '                               <div ng-switch-when="$or">  '  + 
                '                                   <md-input-container>  '  + 
                '                                       <md-select ng-model="type" placeholder="Select a matcher">  '  + 
                '                                           <md-option ng-value="match" ng-repeat="match in [\'$and\',\'$or\']">{{ match }}</md-option>  '  + 
                '                                       </md-select>  '  + 
                '                                   </md-input-container>  '  + 
                '                                   <filter-condition table="table" condition="query" schema="schema"></filter-condition>  '  + 
                '                               </div>  '  + 
                '                               <div ng-switch-when="individual">  '  + 
                '                                   <div ng-repeat="(columnName,cons) in condition" layout-gt-xs="row">  '  + 
                '                                       <md-input-container>  '  + 
                '                                           <md-select ng-model="columnName" placeholder="Select a column">  '  + 
                '                                               <md-option ng-value="column.name" ng-repeat="column in schema | filter: {context: table}">{{ column.name }}</md-option>  '  + 
                '                                           </md-select>  '  + 
                '                                       </md-input-container>  '  + 
                '                                       <div ng-click="add()"> add condition</div>  '  + 
                '                                       <div ng-repeat="con in keys(cons)" layout-gt-xs="row">  '  + 
                '                                           <md-input-container>  '  + 
                '                                               <md-select ng-model="con" placeholder="Select a matcher">  '  + 
                '                                                   <md-option ng-value="matcher.name" ng-repeat="matcher in matchers">{{ matcher.displayName }}</md-option>  '  + 
                '                                               </md-select>  '  + 
                '                                           </md-input-container>  '  + 
                '                                           <md-input-container>  '  + 
                '                                               <label>Value</label>  '  + 
                '                                               <input ng-model="cons[con]" type="text">  '  + 
                '                                           </md-input-container>  '  + 
                '                                       </div>  '  + 
                '                                   </div>  '  + 
                '                               </div>  '  + 
                '                           </div>  '  + 
                '                      </div>  ' ; ;
                var type = Object.prototype.toString.call(scope.condition);
                if (type == '[object Array]') {
                    scope.type = 'Array';
                    scope.query = scope.condition;
                } else if (type == '[object Object]') {
                    if (scope.condition['$and']) {
                        scope.type = '$and';
                        scope.query = scope.condition['$and'];
                    } else if (scope.condition['$or']) {
                        scope.type = '$or';
                        scope.query = scope.condition['$or'];
                    } else {
                        scope.type = 'individual';
                        var columns = Object.keys(scope.condition);
                        var columnName = '';
                        for (var j = 0; j < columns.length; j++) {
                            if (columns[j] != '$$hashKey') {
                                columnName = columns[j];
                                break;
                            }
                        }

                        for (var index = 0; index < scope.schema.length; index++) {
                            if (scope.schema[index].context == scope.table && scope.schema[index].name == columnName) {
                                scope.matchers = mongoQueryFactory.getSupportedQuery(scope.schema[index].type);
                                break;
                            }
                        }

                    }
                }
                scope.add = function(){
                    console.log(scope.condition);
                }
                elem.replaceWith($compile($(template))(scope));
            }
        }]);




}());
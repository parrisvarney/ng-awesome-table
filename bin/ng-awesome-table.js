'use strict';

angular.module('ngAwesomeTable', []).directive('ngaTable', function () {
    return {
        restrict: 'A',
        scope: {
            model: '='
        },

        controller: ['$scope', '$filter', function ($scope, $filter) {
            var _this = this;

            // Copy the model to local scope so that it can be filtered without affecting the originating data
            $scope.$watch('model', function (newVal) {
                return $scope.rows = newVal;
            });
            $scope.rows = $scope.model;

            // Make this directives isolated scope public to child directives
            this.getScope = function () {
                return $scope;
            };

            // Remember the all the field filters
            this.filterObj = {};

            /**
             * Applies any ngFilters to the model
             *
             * @param field
             *   The field name to filter over
             *
             * @param value
             *   The field value to filter over
             */
            this.filter = function (field, value) {
                _this.filterObj[field] = value;
                $scope.$apply(function () {
                    return $scope.rows = $filter('filter')($scope.model, _this.filterObj);
                });
            };

            /**
             * Sorts the displayed model rows
             *
             * @param field
             *   The field name to sort over
             *
             * @param direction
             *   The direction to sort (true: descending, false: ascending)
             */
            this.sort = function (field, direction) {
                return $scope.$apply(function () {
                    return $scope.rows = $filter('orderBy')($scope.rows, field, direction);
                });
            };
        }]
    };
}).directive('ngaRow', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        require: '^^ngaTable',
        link: function link(scope, element, attributes, ctrl) {
            // Create a new table row
            var row = angular.element('<tr>');

            // Apply attributes of the ngaRow to the new table row then convert the nga-row attribute to ng-repeat.
            angular.forEach(attributes.$attr, function (key, attribute) {
                if (key == 'nga-row') {
                    row.attr('ng-repeat', attributes[attribute] + ' in rows');
                } else {
                    row.attr(key, attributes[attribute]);
                }
            });

            // Attach the row content to the new table row
            var template = row.append(element.children());

            // Compile the new row and attach it to the DOM
            element.parent().append($compile(template)(ctrl.getScope()));
        }
    };
}]).directive('ngaFilter', function () {
    return {
        restrict: 'A',
        require: '^^ngaTable',
        link: function link(scope, element, attributes, ctrl) {
            // Create a new text input to contain the filter
            var input = angular.element('<input type="text"/>').addClass('nga-filter');

            // Attach a filter listener to keyup on the new text input
            input.keyup(function (event) {
                return ctrl.filter(attributes.ngaFilter, event.target.value);
            });
            element.append(input);
        }
    };
}).directive('ngaSort', function () {
    return {
        restrict: 'A',
        require: '^^ngaTable',
        link: function link(scope, element, attributes, ctrl) {
            var sorter = angular.element('<span>').addClass('nga-sorter').addClass('nga-sorter-ascending'),
                classes = ['nga-sorter-ascending', 'nga-sorter-descending'];

            sorter.click(function () {
                sorter.data('direction', !sorter.data('direction'));
                var direction = sorter.data('direction');

                ctrl.sort(attributes.ngaSort, direction);

                $('.nga-sorter').removeClass(classes.join(' ')).addClass('nga-sorter-ascending');

                sorter.removeClass(classes.join(' '));
                sorter.addClass(classes[+direction]);
            });

            element.append(sorter);
        }
    };
});
//# sourceMappingURL=ng-awesome-table.js.map

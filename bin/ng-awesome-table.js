'use strict';

angular.module('ngAwesomeTable', []).directive('ngaTable', function () {
    return {
        restrict: 'A',
        link: function link(scope, element, attributes, ctrl) {
            scope.model = attributes.ngaModel;

            // Setup pagination control if nga-paginate is set
            if (attributes.ngaPaginate) {
                var paginater = angular.element('<div><span class="nga-prev-page"></span> <span class="nga-next-page"></span></div>');
                paginater.find('.nga-prev-page').click(function () {
                    return ctrl.paginate('-');
                });
                paginater.find('.nga-next-page').click(function () {
                    return ctrl.paginate('+');
                });

                element.append(paginater);

                scope.paginateRowsPerPage = attributes.ngaPaginate;
                scope.paginateCurrentPage = 1;
            }
        },
        controller: ['$scope', '$filter', '$timeout', '$parse', function ($scope, $filter, $timeout, $parse) {
            var _this = this;

            // Watch the model
            $scope.$watch(function () {
                return $parse($scope.model)($scope);
            }, function (newVal) {
                _this.originalRows = newVal;
                $scope.rows = newVal;
                _this.applyFilter({});
            });

            $scope.rows = $scope.model;

            // Make this directive's isolated scope public to its children
            this.getScope = function () {
                return $scope;
            };

            /**
             * Applies any ngFilters to the model
             *
             * @param field
             *   The field name to filter over
             *
             * @param value
             *   The field value to filter over
             */
            this.filterObj = {};
            this.filter = function (field, value) {
                if (value === '') {
                    delete _this.filterObj[field];
                } else {
                    _this.filterObj[field] = value;
                }

                _this.applyFilter({
                    filter: _this.filterObj
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
                _this.applyFilter({
                    sort: { field: field, direction: direction }
                });
            };

            /**
             * Filters out rows that are outside of the current page
             *
             * @param page
             *   The page to flip to.
             *   '+': The next page
             *   '-': The previous page
             *   n:   A specific page
             */
            this.paginate = function (page) {
                switch (page) {
                    case '+':
                        $scope.paginateCurrentPage++;break; //TODO Dont go past last page
                    case '-':
                        $scope.paginateCurrentPage = Math.max($scope.paginateCurrentPage - 1, 1);break;
                    default:
                        $scope.paginateCurrentPage = page;break;
                }

                _this.applyFilter({
                    paginate: {
                        rows: $scope.paginateRowsPerPage,
                        offset: $scope.paginateRowsPerPage * ($scope.paginateCurrentPage - 1)
                    }
                });
            };

            /**
             * Applies a new filter to the current list of filters, then runs them in order.
             * Filter order is filter, sort, then paginate.
             *
             * @param filter
             *   The filter object to apply.  The object structure is {filterName: {parameters}}
             */
            this.filters = {
                filter: {},
                sort: { field: '', direction: 1 },
                paginate: { rows: $scope.paginateRowsPerPage, offset: 0 }
            };
            this.applyFilter = function (filter) {
                angular.extend(_this.filters, filter);
                var rows = $filter('filter')(_this.originalRows, _this.filters.filter);
                rows = $filter('limitTo')(rows, $scope.paginateRowsPerPage, _this.filters.paginate.offset);
                rows = $filter('orderBy')(rows, function (row) {
                    return row[_this.filters.sort.field] ? row[_this.filters.sort.field] : -1;
                }, // Otherwise we'd get nulls between M and O like ['Mike', null, 'Other']
                _this.filters.sort.direction);

                $timeout(function () {
                    return $scope.rows = rows;
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

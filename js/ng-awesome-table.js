'use strict';
angular.module('ngAwesomeTable', [])
    .directive('ngaTable', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attributes, ctrl) {
                scope.model = attributes.ngaModel;

                // Setup pagination control if nga-paginate is set
                if (attributes.ngaPaginate) {
                    let paginater = angular.element('<div><span class="nga-prev-page"></span> <span class="nga-next-page"></span></div>');
                    paginater.find('.nga-prev-page').click(() => ctrl.paginate('-'));
                    paginater.find('.nga-next-page').click(() => ctrl.paginate('+'));

                    element.append(paginater);

                    scope.paginateRowsPerPage = attributes.ngaPaginate;
                    scope.paginateCurrentPage = 1;
                }
            },
            controller: ['$scope', '$filter', '$timeout', '$parse', function($scope, $filter, $timeout, $parse) {
                // Watch the model
                $scope.$watch(
                    () => $parse($scope.model)($scope),
                    newVal => {
                        this.originalRows = newVal;
                        $scope.rows = newVal;
                        this.applyFilter({});
                    });

                $scope.rows = $scope.model;

                // Make this directive's isolated scope public to its children
                this.getScope  = () => $scope;

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
                this.filter = (field, value) => {
                    if (value === '') {
                        delete this.filterObj[field];
                    } else {
                        this.filterObj[field] = value;
                    }

                    this.applyFilter({
                        filter: this.filterObj
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
                this.sort = (field, direction) => {
                    this.applyFilter({
                        sort: {field, direction}
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
                this.paginate = (page) => {
                    switch(page) {
                        case '+': $scope.paginateCurrentPage++; break; //TODO Dont go past last page
                        case '-': $scope.paginateCurrentPage = Math.max($scope.paginateCurrentPage-1, 1); break;
                        default:  $scope.paginateCurrentPage = page; break;
                    }

                    this.applyFilter({
                        paginate: {
                            rows:   $scope.paginateRowsPerPage,
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
                    filter:   {},
                    sort:     {field: '', direction: 1},
                    paginate: {rows: $scope.paginateRowsPerPage, offset: 0}
                };
                this.applyFilter = filter => {
                    angular.extend(this.filters, filter);
                    let rows = $filter('filter')(this.originalRows, this.filters.filter);
                    rows = $filter('limitTo')(rows, $scope.paginateRowsPerPage, this.filters.paginate.offset);
                    rows = $filter('orderBy')(
                        rows,
                        row => row[this.filters.sort.field] ? row[this.filters.sort.field] : -1, // Otherwise we'd get nulls between M and O like ['Mike', null, 'Other']
                        this.filters.sort.direction
                    );

                    $timeout(() => $scope.rows = rows);
                };
            }]
        }
    })
    .directive('ngaRow', ['$compile', function($compile) {
        return {
            restrict: 'A',
            require:  '^^ngaTable',
            link: function(scope, element, attributes, ctrl) {
                // Create a new table row
                let row = angular.element('<tr>');

                // Apply attributes of the ngaRow to the new table row then convert the nga-row attribute to ng-repeat.
                angular.forEach(attributes.$attr, (key, attribute) => {
                    if (key == 'nga-row') {
                        row.attr('ng-repeat', attributes[attribute] + ' in rows');
                    } else {
                        row.attr(key, attributes[attribute]);
                    }
                });

                // Attach the row content to the new table row
                let template = row.append(element.children());

                // Compile the new row and attach it to the DOM
                element.parent().append($compile(template)(ctrl.getScope()));
            }
        }
    }])
    .directive('ngaFilter', function() {
        return {
            restrict: 'A',
            require:  '^^ngaTable',
            link: function(scope, element, attributes, ctrl) {
                // Create a new text input to contain the filter
                let input = angular.element('<input type="text"/>').addClass('nga-filter');

                // Attach a filter listener to keyup on the new text input
                input.keyup(event => ctrl.filter(attributes.ngaFilter, event.target.value));
                element.append(input);
            }
        }
    })
    .directive('ngaSort', function() {
        return {
            restrict: 'A',
            require:  '^^ngaTable',
            link: function(scope, element, attributes, ctrl) {
                let sorter = angular.element('<span>').addClass('nga-sorter').addClass('nga-sorter-ascending'),
                    classes = ['nga-sorter-ascending', 'nga-sorter-descending'];

                sorter.click(function() {
                    sorter.data('direction', !sorter.data('direction'));
                    let direction = sorter.data('direction');

                    ctrl.sort(attributes.ngaSort, direction);

                    $('.nga-sorter')
                        .removeClass(classes.join(' '))
                        .addClass('nga-sorter-ascending');

                    sorter.removeClass(classes.join(' '));
                    sorter.addClass(classes[+direction])
                });

                element.append(sorter);
            }
        }
    })
;

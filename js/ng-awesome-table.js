'use strict';
angular.module('ngAwesomeTable', [])
    .directive('ngaTable', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attributes) {
                scope.model = attributes.model;
            },
            controller: ['$scope', '$filter', function($scope, $filter) {
                // Watch the model
                $scope.$watch(
                    () => $parse($scope.model)($scope),
                    newVal => {
                        $scope.originalRows = newVal;
                        $scope.rows = newVal;
                    });
                $scope.rows = $scope.model;

                // Make this directives isolated scope public to child directives
                this.getScope  = () => $scope;

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
                this.filter = (field, value) => {
                    this.filterObj[field] = value;
                    $scope.$apply(() => $scope.rows = $filter('filter')($scope.originalRows, this.filterObj));
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
                this.sort = (field, direction) =>
                    $scope.$apply(() => $scope.rows = $filter('orderBy')($scope.rows, field, direction));
            }]
        }
    }])
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

# Angular Awesome Table

An awesomely simple AngularJS plugin for sorting and filtering tables.

## Why?

There are already [several](https://github.com/esvit/ng-table) [other](https://github.com/lorenzofox3/Smart-Table) [AngularJS](https://github.com/samu/angular-table) [table](https://github.com/angular-ui/ui-grid) [plugins](https://github.com/obogo/ux-angularjs-datagrid).  So why do we need another?

Many of the other table plugins sacrifice simplicity in the name of functionality.  Functionality can be totally 
cool sometimes, but at other times we just need what we need.

Awesome table provides just a couple useful features that would otherwise be a cumbersome exercise to implement on a
project by project basis.

We've got:
* Sorting
* Filtering
* Pagination (soon)

## How?

Awesome table was created by first defining the html semantics, and then by figuring out the Javascript.  This means
that everything is done in the view - there is no need to worry about configuring frail data structures in your 
controllers, or stepping through library source code to discover poorly documented features.

The markup
```html
<table nga-table model="awesomeFeatures">
    <thead>
    <tr>
        <th nga-filter="name" nga-sort="name">Feature Name</th>
        <th nga-filter="description" nga-sort="description">Description</th>
        <th nga-filter="tag" nga-sort="tag">tag</th>
        <th nga-filter="date" nga-sort="date">Feature Date</th>
    </tr>
    </thead>
    <tbody>
    <tr nga-row="feature">
        <td>{{feature.name}}</td>
        <td>{{feature.description}}</td>
        <td>{{feature.tag}}</td>
        <td>{{feature.date}}</td>
    </tr>
    </tbody>
</table>

```

The JS (note that there's not any actual code, it's just mock data)
```javascript
angular.module('awesome-module', [])
    .controller('awesome-controller', ['$scope', function($scope) {
        $scope.awesomeFeatures = [{
            name: 'Filtering',
            description: 'Free text filters for each table column',
            tag: '0.0.1',
            date: '2016-01-01 01:00:00'
        },{
            name: 'Sorting',
            description: 'Sorting on anything you want',
            tag: '0.0.1',
            date: '2016-01-01 02:00:00'
        },{
            name: 'Pagination',
            description: 'This actually isn\'t implmented yet, but it helps showcase the awesome features',
            tag: '1.2.0',
            date: '2016-01-01 01:00:00'
         },{
            name: 'Free Money',
            description: 'Accurately predicts lottry numbers... Everybody gets rich. (Also not implemented yet)',
            tag: '3.0.0',
            date: '2016-01-01 01:00:00'
         }]);
```

## More specifically... How?

Activate your awesome table using the nga-table attribute.  From there are three awesome directives.

### model

This is the data source for the table.  It's generally an array, and something that would normally be the source
for `ng-repeat`.

### nga-row

This is the alias used for each row iteration.  Think `<tr ng-repeat="feature in awesomeFeatures">` where `feature` 
would be the `ng-row`, and `awesomeFeatures` would be the `model`.

### nga-filter

This will create a text field that will filter the `model` based on its contents.

### nga-sort

This will create an awesome column sorter.  Simple as that.
 


## Upcoming
* Sorting on callbacks
* Filtering on callbacks
* Pagination

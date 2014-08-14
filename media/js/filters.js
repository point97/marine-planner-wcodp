function filteringModel() {
	var self = this;

	self.startDate = ko.observable(new Date(2002, 3, 2));
	self.toDate = ko.observable(false);
	self.eventTypes = ko.observableArray();

    // list of filter layermodels
    self.filterLayers = ko.observableArray();

    self.inclusiveFilterLayer = false;

    self.filters = ko.observableArray();
    app.filterTypeAheadSource = function() {
        var filter_stuff = app.viewModel.filterTab.filters();
        return jQuery.map(filter_stuff, function(x) {
            return x.name;
        });
    }

    self.filterButtonIsActive = ko.observable(true);

    self.showFilterInfo = function() {
    }
    self.showFilterInfoButtonIsActive = ko.observable(false);
    self.filterInfoItems = ko.observableArray();

    self.updateFilter = function() {
        var layers = _.filter(self.filterLayers(), function(x) {
            return x.active() == true;
        });
        for (var i in layers) {
            var idx = self.filterLayers().indexOf(layers[i]);
            if (idx != -1) {
                // NOTE: We use toggleActive here because it has hooks into
                // the map stuff that will actually cause it to update the
                // filters.
                self.filterLayers()[idx].toggleActive();
            }
        }

    	var filterString = "[",
            startDate = self.startDate(),
            toDate = self.toDate(),
            eventTypes = self.eventTypes;
            categoryFilterStr = "[";
    	if (startDate) {
    		filterString += JSON.stringify({'type': 'fromDate', 'value': (startDate.getMonth()+1) + '/' + startDate.getDate() + '/' + startDate.getFullYear()});
    	} 
    	if (toDate) {    		
    		if (startDate) {
    			filterString += ','
    		}
    		filterString += JSON.stringify({'type': 'toDate', 'value': (toDate.getMonth()+1) + '/' + toDate.getDate() + '/' + toDate.getFullYear()});
    	} 

        // NOTE:  filterItems might only be relevant for Beach Cleanup layer and not for Derelict Gear layer...
        var filterItems = $('#filter-by .select2-choices .select2-search-choice div').contents();
        self.filterInfoItems.removeAll();
        // TODO:  add spinner (somewhere) indicating to the user that the new layer is loading

        // var filterList = [];
        $.each(filterItems, function(index, value) {
            var filterField = _.findWhere(self.filters(), {name: value.data});
            var toPush = {
                'name': value.data,
                'fields': []
            };

            // This is for the 'Active Filters' display:
            $.each(filterField.subfields, function(iter, val) {
                toPush.fields.push(val);
            });
            toPush.fields.sort();
            self.filterInfoItems.push(toPush);

            if (filterField.slug) {
                // Actually build the filter string with the slug we have:
                if (filterString.charAt(filterString.length-1) !== '[') {
                    filterString += ','
                }
                filterString += JSON.stringify({'type': 'field', 'value': filterField.slug});
            } else if (filterField.name && filterField.subfields.length > 0) {
                //This is probably a category
                if (categoryFilterStr.charAt(categoryFilterStr.length-1) !== '[') {
                    categoryFilterStr += ','
                }
                categoryFilterStr += JSON.stringify(filterField.name);
            }
        });

    	filterString += "]";
    	categoryFilterStr += "]";
        if (categoryFilterStr != '[]')
            filterString += "&categories=" + categoryFilterStr

        for (var i in layers) {
            var idx = self.filterLayers().indexOf(layers[i]);
            if (idx != -1) {
                // NOTE: We use toggleActive here because it has hooks into
                // the map stuff that will actually cause it to update the
                // filters.
                self.filterLayers()[idx].filter = filterString;
                self.filterLayers()[idx].toggleActive();
            }
        }

        if (filterItems.length > 0) {
            self.showFilterInfoButtonIsActive(true);
        } else {
            self.showFilterInfoButtonIsActive(false);
        }
    };
} // end filteringModel

app.viewModel.filterTab = new filteringModel();

$.ajax ({
    url: "/proxy/events/get_filters",
    type: 'GET',
    dataType: 'json'
  }).done(function (filters) {
    app.viewModel.filterTab.filters(filters);
  });

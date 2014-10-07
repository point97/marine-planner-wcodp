function filteringModel() {
	var self = this;
	
	self.startDate = ko.observable();
	self.toDate = ko.observable();
	self.eventTypes = ko.observableArray();

    // list of filter layermodels
    self.filterLayers = ko.observableArray();

    self.filters = ko.observableArray();
    app.filterTypeAheadSource = function() {
        var filter_stuff = app.viewModel.filterTab.filters();
        return jQuery.map(filter_stuff, function(x) {
            return x.name;
        });
    }

    self.filterButtonIsActive = ko.observable(true);

    self.showFilterInfo = function() {
        if (self.showFilterInfoButtonIsActive()) {
            $('#filter-info-modal').modal();
        }
    }
    self.showFilterInfoButtonIsActive = ko.observable(false);
    self.filterInfoItems = ko.observableArray();

    self.dateToString = function(d) {
        // Return a date in YYYY-MM-DD format
        // Neat trick from http://stackoverflow.com/a/3605248/65295
        return d.getFullYear() + '-' + 
              ('0' + (d.getMonth()+1)).slice(-2) + '-' + 
              ('0' + d.getDate()).slice(-2);
    }

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

        // key-only maps (to eliminate any duplicate entries)
        var categories = {};
        var concepts = {};

        var from = self.startDate(); 
        var to = self.toDate(); 
        var type = self.eventTypes; 

        // NOTE:  filterItems might only be relevant for Beach Cleanup layer and not for Derelict Gear layer...
        var filterItems = $('#filter-by .select2-choices .select2-search-choice div').contents();
        self.filterInfoItems.removeAll();
        // TODO:  add spinner (somewhere) indicating to the user that the new layer is loading

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
                concepts[filterField.slug] = undefined;
            }
            else if (filterField.name && filterField.subfields.length > 0) {
                //This is probably a category

                // filterField.name is not a slug; we can get the name subfields from self.filters (or let the django do it)
                categories[filterField.name] = undefined;
            }
        });

        var queryParameters = {}
        
        if (Object.keys(concepts).length > 0) {
            queryParameters['concepts'] = Object.keys(concepts).join(',');
        }
        
        if (Object.keys(categories).length > 0) {
            queryParameters['categories'] = Object.keys(categories).join(',');
        }

        if (from) { 
            queryParameters['from'] = self.dateToString(from);
        }

        if (to) { 
            queryParameters['to'] = self.dateToString(to);
        }
        
        if (type) { 
            queryParameters['type'] = type;
        }
        
        var queryString = '&' + $.param(queryParameters)
        
        for (var i in layers) {
            // TODO: Why aren't we just using layers?
            var idx = self.filterLayers().indexOf(layers[i]);
            if (idx != -1) {
                // NOTE: We use toggleActive here because it has hooks into
                // the map stuff that will actually cause it to update the
                // filters.

                self.filterLayers()[idx].filter = queryString;
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

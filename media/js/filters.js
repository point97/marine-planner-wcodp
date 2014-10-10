ko.bindingHandlers.datePicker = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        // Register change callbacks to update the model if the control changes
        ko.utils.registerEventHandler(element, "change", function() {
            var value = valueAccessor();
            value(new Date(element.value));
        });
    },
    // update the control whenever the view model changes
    update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(); 
        value = value(); // get the date
        element.value = app.dateToString_us(value);
    }
}

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

    self.updateFilter = function() {
        var layers = _.filter(self.filterLayers(), function(x) {
            return x.active() == true;
        });

        // key-only maps (to eliminate any duplicate entries)
        var categories = {};
        var concepts = {};

        var from = self.startDate(); 
        var to = self.toDate(); 

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
        
        var queryString = '&' + $.param(queryParameters)
        
        for (var i in layers) {
            // TODO: Why aren't we just using layers?
            var idx = self.filterLayers().indexOf(layers[i]);
            if (idx != -1) {
                self.filterLayers()[idx].deactivateLayer();
                self.filterLayers()[idx].filter = queryString;
                self.filterLayers()[idx].activateLayer();
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

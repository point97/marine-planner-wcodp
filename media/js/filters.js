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
	
    var today = new Date();
    var lastYear = new Date();
    lastYear.setYear(today.getFullYear() - 1);
	self.startDate = ko.observable(lastYear);
	self.toDate = ko.observable(today);
	self.eventTypes = ko.observableArray();

    // list of filter layermodels
    self.filterLayers = ko.observableArray();

    self.filters = ko.observableArray();
    self.allowedAttributeNames = [];
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

    //** Handle a click from the Update Filter button. 
    self.updateFilter = function() {
        var layers = _.filter(self.filterLayers(), function(x) {
            return x.active() == true;
        });

        filters = self.getFilters();

        for (var i in layers) {
            // TODO: Why aren't we just using layers?
            var idx = self.filterLayers().indexOf(layers[i]);
            if (idx != -1) {
                self.filterLayers()[idx].applyFilters(filters);
            }
        }

        if (self.filterInfoItems().length > 0) {
            self.showFilterInfoButtonIsActive(true);
        }
        else {
            self.showFilterInfoButtonIsActive(false);
        }
    };

    //** Return a map of concepts and categories (list of concepts)
    self.getOntologyFilters = function() {
        // key-only maps (to eliminate any duplicate entries)
        var categories = {};
        var concepts = {};
        
        // NOTE:  filterItems might only be relevant for Beach Cleanup layer and not for Derelict Gear layer...
        var filterItems = $('#filter-by .select2-choices .select2-search-choice div').contents();
        
        // TODO: What is filterInfoItems for?
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
        
        return {'concepts': Object.keys(concepts), 
                'categories': Object.keys(categories)};
    }
    
    //** Return the current state of the filter tab as a query string
    self.getFilters = function() {
        var from = self.startDate(); 
        var to = self.toDate(); 
        var queryParameters = {}
        var ontologyFilters = self.getOntologyFilters();
        var concepts = ontologyFilters['concepts']; 
        var categories = ontologyFilters['categories']; 
        
        if (concepts.length > 0) {
            queryParameters['concepts'] = concepts.join(',');
        }
        
        if (categories.length > 0) {
            queryParameters['categories'] = categories.join(',');
        }

        if (from) { 
            queryParameters['from'] = app.dateToString(from);
        }

        if (to) { 
            queryParameters['to'] = app.dateToString(to);
        }
        
        var queryString = '&' + $.param(queryParameters);
        
        return queryString; 
    }


    //** Returns whether an internal name (slug) corresponds to something that
    // can be counted, based on whether or not the name is present in the 
    // ontology. 
    // MP-155: filter returned data to show only attrs that are present
    // in the ontology (effectively disabling the derelict gear layer)
    // Build search table
    // filters format is [{name:"...", slug:"..."}]
    // if it's a category, then it has a "subfields" property that
    // references another item without a subfield, so we can ignore
    // categories altogether. 
    self.countableName = function(name) {
        return name in self.allowedAttributeNames;
    };
    
    self._buildAllowedAttrIndex = function() {
        self.allowedAttributeNames = [];
        var filters = self.filters();
        
        for (var i = 0; i < filters.length; i++) {
            if (filters[i].subfields.length > 0) {
                continue;
            }
            // some of the terms in the ontology are broken
            if (filters[i].slug == "") {
                console.debug(i, filters[i]);
                continue;
            }
        
            self.allowedAttributeNames[filters[i].slug] = undefined;
        }
        
        console.debug("Allowed Attributes", allowedAttrs);
    };

} // end filteringModel

app.viewModel.filterTab = new filteringModel();

$.ajax({
    url: "/proxy/events/get_filters",
    type: 'GET',
    dataType: 'json'
}).done(function (filters) {
    var sorted_filters = _.sortBy(filters, 'name');
    app.viewModel.filterTab.filters(sorted_filters);
    app.viewModel.filterTab._buildAllowedAttrIndex();
});

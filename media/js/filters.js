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
    lastYear.setYear(today.getFullYear() - 3);

	self.fromDate = ko.observable(lastYear);
    self.fromDate.subscribe( function() {
        // self.highlightUpdateFilter();
        if(self.activeFilterLayers().length !== 0) {
            self.updateFilterButtonIsEnabled(true);            
        } else {
            self.updateFilterButtonIsEnabled(false);
        }
        
    });

    self.toDate = ko.observable(today);
    self.toDate.subscribe( function() {
        // self.highlightUpdateFilter();
        if(self.activeFilterLayers().length !== 0) {
            self.updateFilterButtonIsEnabled(true);            
        } else {
            self.updateFilterButtonIsEnabled(false);
        }
    });

    self.eventTypes = ko.observableArray();

    // list of filter layermodels
    self.filterLayers = ko.observableArray(); 

    // Selected clusterbubble info (populated on click)
    // TODO: Does knockout have an observable object?
    // "shortCategories" is the first 5 elements of the categories array. 
    // Needed until I know how to make knockout use a regular for loop
    self.selectedClusterInfo = {
        count: ko.observable(),
        anyUncountable: ko.observable(),
        categories: ko.observableArray(),
        shortCategories: ko.observableArray(),
        moreCategories: ko.observable(),
        sites: ko.observableArray(),
        shortSites: ko.observableArray(),
        moreSites: ko.observable()
    };

    self.filters = ko.observableArray();
    self.allowedAttributeNames = [];
    app.filterTypeAheadSource = function() {
        var filter_stuff = app.viewModel.filterTab.filters();
        return jQuery.map(filter_stuff, function(x) {
            return x.name;
        });
    }

    self.updateFilterButtonIsEnabled = ko.observable(false);

    self.showFilterInfo = function() {
        self.getOntologyFilters();
        if (self.filterInfoButtonIsEnabled()) {
            $('#filter-info-modal').modal();
        }
    }
    self.filterInfoButtonIsEnabled = ko.observable(false);
    self.filterInfoItems = ko.observableArray();

    self.updateFilterClick = function() {
        if (self.updateFilterButtonIsEnabled()) {
            self.updateFilter();
        }
    };

    //** Handle a click from the Update Filter button. 
    self.updateFilter = function() {
        var layers = _.filter(self.filterLayers(), function(x) {
            return x.active() == true;
        });

        self.updateFilterButtonIsEnabled(false);

        filters = self.getFilters();

        for (var i in layers) {
            // TODO: Why aren't we just using layers?
            var idx = self.filterLayers().indexOf(layers[i]);
            if (idx != -1) {
                self.filterLayers()[idx].applyFilters(filters);
            }
        }

        // if (self.filterInfoItems().length > 0) {
        //     self.filterInfoButtonIsEnabled(true);
        // }
        // else {
        //     self.filterInfoButtonIsEnabled(false);
        // }
        app.updateUrl();
    };

    self.getFilterItems = function() {
        return $('#filter-by .select2-choices .select2-search-choice div').contents();
        // TODO:  CHANGE TO
        // return $('#filter-select').select2("val");
    };

    //** Return a map of concepts and categories (list of concepts)
    self.getOntologyFilters = function() {
        // key-only maps (to eliminate any duplicate entries)
        var categories = {};
        var concepts = {};
        
        // NOTE:  filterItems might only be relevant for Beach Cleanup layer and not for Derelict Gear layer...
        var filterItems = self.getFilterItems();
        
        // TODO: What is filterInfoItems for?
        // Answer: it's used in the modal that displays the Filter Item Information
        self.filterInfoItems.removeAll();

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
            } else if (filterField.name && filterField.subfields.length > 0) {
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
        var from = self.fromDate(); 
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
    };

    self.getFiltersJSON = function() {
        var from = self.fromDate(); 
        var to = self.toDate(); 
        var queryParameters = {};

        var filterItems = self.getFilterItems();
        var filterList = [];

        $.each(filterItems, function(index, value) {
            var filterField = _.findWhere(self.filters(), {name: value.data});
            
            if (filterField.name) {
                filterList.push(filterField.name);
            } 
        });
        if (filterList.length) {
            queryParameters['filters'] = filterList;
        }            

        if (from) { 
            queryParameters['from'] = app.dateToString(from);
        }

        if (to) { 
            queryParameters['to'] = app.dateToString(to);
        }        
        
        return queryParameters; 
    };

    self.activeFilterLayers = ko.observableArray();
    app.viewModel.activeLayers.subscribe( function(activeLayers) {
        self.activeFilterLayers(_.where(activeLayers, {'filterable': true}));
        if(self.activeFilterLayers().length === 0) {
            self.updateFilterButtonIsEnabled(false);
        }
    });

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
    };

    self.highlightUpdateFilter = function() {
        $('#filter-button').effect("highlight", {color: 'rgba(186, 186, 39, .5)'}, 1000); // , {color: 'blue'}
    }

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

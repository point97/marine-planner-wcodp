function filteringModel() {
	var self = this;

	self.startDate = ko.observable(false);
	self.toDate = ko.observable(false);
	self.eventTypes = ko.observableArray();

    // list of filter layermodels
    self.filterLayers = ko.observableArray();

    self.inclusiveFilterLayer = false;

    // reference to open themes in accordion
    // self.openPrimaryFilters = ko.observableArray();

    // self.openPrimaryFilters.subscribe( function() {
    //     app.updateUrl();
    // });

    // self.primaryFilters = ko.observableArray();

    self.filters = ko.observableArray();

    self.filterButtonIsActive = ko.observable(true);

    // self.loadingFilterLayer = ko.observable(false);
    // self.emptyLayer = ko.observable(false);

    // self.updateFilter = function() {
    //     // self.filterButtonIsActive(false);
    //     // filterItems = $('#filter-by .select2-multiple').select2('val');
    //     var filterItems = $('#filter-by .select2-choices .select2-search-choice div').contents();
    //     var layer = self.filterLayers()[0];
    //     layer.toggleActive();
    //     // add spinner 
    //     // self.loadingFilterLayer(true);
    //     self.emptyLayer(false);

    //     var filterList = [];
    //     $.each(filterItems, function(index, value) { 
    //         var filterField = _.findWhere(self.filters().fields, {name: value.data});
    //         if (filterField.slug) {
    //             filterList.push({'type': 'field', 'value': filterField.slug});
    //         }
    //     });
    //     // console.log(JSON.stringify(filterList));
    //     layer.filter = JSON.stringify(filterList);
    //     layer.toggleActive();
    //     // remove spinner and report back if layer has no features
    //     // self.loadingFilterLayer(false);
    //     // if (self.filterLayers() && self.filterLayers()[0] && self.filterLayers()[0].active()) {
    //     //     var numFeatures = self.filterLayers()[0].layer.features.length;
    //     //     if (numFeatures === 0) {
    //     //         self.emptyLayer(true);
    //     //     } 
    //     // }
    // };

    self.updateFilter = function() {
        var layers = self.filterLayers();
        layers.map(function(x) { x.toggleActive(); });

    	var filterString = "[",    	    
    		// startDate = options.startDate || self.startDate(),
    		// toDate = options.toDate || self.toDate(),
            // eventTypes = options.eventTypes || self.eventTypes;
            startDate = self.startDate(),
            toDate = self.toDate(),
            eventTypes = self.eventTypes;
    	if (startDate) {
    		// filterString = '?filter=[{"type":"fromDate","value":' + '"' + startDate.getDate() + '/' + (startDate.getMonth()+1) + '/' + startDate.getFullYear() + '"}]';	
    		filterString += JSON.stringify({'type': 'fromDate', 'value': (startDate.getMonth()+1) + '/' + startDate.getDate() + '/' + startDate.getFullYear()});
    	} 
    	if (toDate) {    		
    		if (startDate) {
    			filterString += ','
    		}
    		filterString += JSON.stringify({'type': 'toDate', 'value': (toDate.getMonth()+1) + '/' + toDate.getDate() + '/' + toDate.getFullYear()});
    	} 
        // if (eventTypes) {           
        //     for (var index=0; index<eventTypes.length; index+=1) {
        //         if (startDate || toDate || index>0) {
        //             filterString += ','
        //         }
        //         filterString += JSON.stringify({'type': 'event_type', 'value': eventTypes[index]});
        //     }
        // } 

        // NOTE:  filterItems might only be relevant for Beach Cleanup layer and not for Derelict Gear layer...
        var filterItems = $('#filter-by .select2-choices .select2-search-choice div').contents();
        // TODO:  add spinner (somewhere) indicating to the user that the new layer is loading
        // self.loadingFilterLayer(true);
        // self.emptyLayer(false);

        // var filterList = [];
        $.each(filterItems, function(index, value) { 
            var filterField = _.findWhere(self.filters().fields, {name: value.data});
            if (filterField.slug) {
                if (filterString.charAt(filterString.length-1) !== '[') {
                    filterString += ','
                }
                filterString += JSON.stringify({'type': 'field', 'value': filterField.slug});
            }
        });
        // console.log(JSON.stringify(filterList));
        // layer.filter = JSON.stringify(filterList);

    	filterString += "]";
    	// return filterString;
        layers.map(function(x) {
            x.filter = filterString;
            x.toggleActive();
        });

        if (filterItems.length > 0) {
            self.showFilterInfoButtonIsActive(true);
        } else {
            self.showFilterInfoButtonIsActive(false);
        }
    };

 //    self.startDate.subscribe(function(newStartDate) {
 //    	$.each(self.filterLayers(), function(i, layer) {
 //    		layer.filter = self.createFilterString({'startDate': newStartDate});
 //    		layer.layer = app.addGridSummaryLayerToMap(layer);
	// 	});
	// });

 //    self.toDate.subscribe(function(newToDate) {
 //    	$.each(self.filterLayers(), function(i, layer) {
 //    		layer.filter = self.createFilterString({'toDate': newToDate});
 //    		layer.layer = app.addGridSummaryLayerToMap(layer);
	// 	});
	// });

 //    self.eventTypes.subscribe(function(newEventTypes) {
 //        $.each(self.filterLayers(), function(i, layer) {
 //            layer.filter = self.createFilterString({'eventTypes': newEventTypes});
 //            layer.layer = app.addGridSummaryLayerToMap(layer);
 //        });
 //    });
} // end filteringModel

app.viewModel.filterTab = new filteringModel();

// function primaryFilterModel(options) {
//     var self = this;
//     self.name = options.display_name;
//     self.depth = options.depth;
//     console.log(self.name);

//     //add to open filters
//     self.setOpenPrimaryFilter = function() {
//         var filter = this;

//         // ensure filter tab is activated
//         $('#filterTab').tab('show');

//         if (self.isOpenPrimaryFilter(filter)) {
//             //app.viewModel.activeTheme(null);
//             app.viewModel.filterTab.openPrimaryFilters.remove(filter);
//             app.viewModel.updateScrollBars();
//         } else {
//             app.viewModel.filterTab.openPrimaryFilters.push(filter);
//             //setTimeout( app.viewModel.updateScrollBar(), 1000);
//             app.viewModel.updateScrollBars();
//         }
//     };

//     //is in openFilter
//     self.isOpenPrimaryFilter = function() {
//         var filter = this;
//         if (app.viewModel.filterTab.openPrimaryFilters.indexOf(filter) !== -1) {
//             return true;
//         }
//         return false;
//     };

//     return self;
// } // end of primaryFilterModel

$.ajax ({
    url: "/proxy/events/get_filters",
    type: 'GET',
    dataType: 'json'
  }).done(function (filters) {
    app.viewModel.filterTab.filters(filters);
  });

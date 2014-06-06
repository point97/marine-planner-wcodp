

function filteringModel() {
	var self = this;

	self.startDate = ko.observable(false);
	self.toDate = ko.observable(false);
	self.eventTypes = ko.observableArray();

    // list of filter layermodels
    self.filterLayers = ko.observableArray();

    // reference to open themes in accordion
    self.openPrimaryFilters = ko.observableArray();

    self.openPrimaryFilters.subscribe( function() {
        app.updateUrl();
    });

    self.primaryFilters = ko.observableArray();

    self.fields = [{
        name: 'Tin Can',
        slug: 'tin-can'
    }, {
        name: 'Bottle Cap',
        slug: 'bottle-cap'
    }, {
        name: 'Balloon',
        slug: 'balloon'
    }];

    self.updateFilter = function() {
        filterItems = $('#filter-input').text();
        console.log(filterItems);
    }

    self.createFilterString = function(options) {
    	var filterString = "?filter=[",    	    
    		startDate = options.startDate || self.startDate(),
    		toDate = options.toDate || self.toDate(),
            eventTypes = options.eventTypes || self.eventTypes;
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
        if (eventTypes) {           
            for (var index=0; index<eventTypes.length; index+=1) {
                if (startDate || toDate || index>0) {
                    filterString += ','
                }
                filterString += JSON.stringify({'type': 'event_type', 'value': eventTypes[index]});
            }
        } 
    	filterString += "]";
    	return filterString;
    };

    self.startDate.subscribe(function(newStartDate) {
    	$.each(self.filterLayers(), function(i, layer) {
    		layer.filter = self.createFilterString({'startDate': newStartDate});
    		layer.layer = app.addGridSummaryLayerToMap(layer);
		});
	});

    self.toDate.subscribe(function(newToDate) {
    	$.each(self.filterLayers(), function(i, layer) {
    		layer.filter = self.createFilterString({'toDate': newToDate});
    		layer.layer = app.addGridSummaryLayerToMap(layer);
		});
	});

    self.eventTypes.subscribe(function(newEventTypes) {
        $.each(self.filterLayers(), function(i, layer) {
            layer.filter = self.createFilterString({'eventTypes': newEventTypes});
            layer.layer = app.addGridSummaryLayerToMap(layer);
        });
    });
}

app.viewModel.filterTab = new filteringModel();

function primaryFilterModel(options) {
    var self = this;
    self.name = options.display_name;
    self.depth = options.depth;
    console.log(self.name);

    //add to open filters
    self.setOpenPrimaryFilter = function() {
        var filter = this;

        // ensure filter tab is activated
        $('#filterTab').tab('show');

        if (self.isOpenPrimaryFilter(filter)) {
            //app.viewModel.activeTheme(null);
            app.viewModel.filterTab.openPrimaryFilters.remove(filter);
            app.viewModel.updateScrollBars();
        } else {
            app.viewModel.filterTab.openPrimaryFilters.push(filter);
            //setTimeout( app.viewModel.updateScrollBar(), 1000);
            app.viewModel.updateScrollBars();
        }
    };

    //is in openFilter
    self.isOpenPrimaryFilter = function() {
        var filter = this;
        if (app.viewModel.filterTab.openPrimaryFilters.indexOf(filter) !== -1) {
            return true;
        }
        return false;
    };

    return self;
} // end of filterModel

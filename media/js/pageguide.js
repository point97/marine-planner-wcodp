
app.pageguide = {};

/* THE DEFAULT PAGE GUIDE */

var defaultGuide = {
  id: 'default-guide',
  title: 'Default Guide',
  steps: [
    {
      target: '#help-button',
      content: $('#help-text-help-button').html(),
      direction: 'top',
      arrow: {offsetX: 10, offsetY: -10}
    },
    {
      target: '#dataTab',
      content: $('#help-text-dataTab').html(),
      direction: 'top',
      arrow: {offsetX: 45, offsetY: 10}
    },
    {
      target: '#activeTab',
      content: $('#help-text-activeTab').html(),
      direction: 'top',
      arrow: {offsetX: 65, offsetY: 10}
    },
    {
      target: '#legendTab',
      content: $('#help-text-legendTab').html(),
      direction: 'top',
      arrow: {offsetX: 65, offsetY: 10}
    },
    {
      target: '.olControlZoom',
      content: $('#help-text-olControlZoom').html(),
      direction: 'top',
      arrow: {offsetX: -10, offsetY: -10}
    },
    {
      target: '#basemaps',
      content: $('#help-text-basemaps').html(),
      direction: 'left',
      arrow: {offsetX: -100, offsetY: 10}
    }
  ]
};

var defaultGuideOverrides = {
  events: {
    open: function () {
      app.pageguide.defaultOpenStuff();
      
      //open the basemaps buttons and keep them open
      $('#basemaps').addClass('open');
      app.pageguide.preventBasemapsClose = true;      
      
      //adjust the pageguide icon so it is left of the open basemaps buttons 
      for (var i=0; i < defaultGuide.steps.length; i++) {
        if ( defaultGuide.steps[i].target === '#basemaps' ) {
            defaultGuide.steps[i].arrow.offsetX = 0;
        }
      }      
      $('#dataTab').tab('show');
    },
    close: function () {
      app.pageguide.defaultCloseStuff();    
      
      //deactivate the prevention of the basemaps buttons closing
      app.pageguide.preventBasemapsClose = true;
      //close the basemaps buttons
      $('#basemaps').removeClass('open');
      
      //return the offset of the pageguide icon so it doesn't move out of place as the guide closes
      for (var i=0; i < defaultGuide.steps.length; i++) {
        if ( defaultGuide.steps[i].target === '#basemaps' ) {
            defaultGuide.steps[i].arrow.offsetX = -95;
        }
      }
      
    }
  },
  step: {
    events: {
      select: function() {
        if ($(this).data('idx') === 0) {
            app.viewModel.showLayers(true);
            $('#dataTab').tab('show');
            app.viewModel.deactivateAllLayers();
            app.viewModel.closeAllThemes();
            $('#pageGuideMessage').height(120);
        } else if ($(this).data('idx') === 1) {
            app.viewModel.showLayers(true);
            $('#dataTab').tab('show');
            app.viewModel.closeAllThemes();
            app.viewModel.themes()[0].setOpenTheme();
            for (var i=0; i < app.viewModel.themes()[0].layers().length; i++) {
                var layer = app.viewModel.themes()[0].layers()[i];
                if ( layer.name === 'Regional Ocean Partnerships' ) {
                    layer.activateLayer();
                }
            }
            for (var i=0; i < app.viewModel.themes()[0].layers().length; i++) {
                var layer = app.viewModel.themes()[0].layers()[i];
                if ( layer.name === 'Marine Jurisdictions' ) {
                    $.each(layer.subLayers, function(index, sublayer) {
                        sublayer.activateLayer();
                    });
                }
            }
            $('#pageGuideMessage').height(150);
        } else if ($(this).data('idx') === 2) {
            app.viewModel.showLayers(true);
            $('#activeTab').tab('show');
            $('#pageGuideMessage').height(150);
        } else if ($(this).data('idx') === 3) {
            app.viewModel.showLayers(true);
            $('#legendTab').tab('show');
            $('#pageGuideMessage').height(150);
        } else {
            //app.viewModel.showLayers(true);
            //$('#dataTab').tab('show');
            //$('#basemaps').addClass('open');
            $('#pageGuideMessage').height(150);
        }
      }
    }
  }
};

/* THE DATA PANEL PAGE GUIDE */
//var layerName = $('.layer').first().find('div').first().attr('name');
//var targetLayer = "div[name*='" + layerName + "']";
var dataGuide = {
  id: 'data-guide',
  title: 'Data Guide',
  steps: [
    {
      target: '#dataTab',
      content: $('#help-text-data-tour-dataTab').html(),
      direction: 'right',
      arrow: {offsetX: 0, offsetY: 0}
    },
    {
      target: '.search-form',
      content: $('#help-text-data-tour-form-search').html(),
      direction: 'top',
      arrow: {offsetX: 180, offsetY: 0}
    },
    {
      target: '.accordion-heading',
      content: $('#help-text-data-tour-theme').html(),
      direction: 'right',
      arrow: {offsetX: -10, offsetY: 10}
    },
    {
      target: '.layer div',
      //target: "div[name*='" + $('.layer').first().find('div').first().attr('name') + "']",
      //target: "div[name*='EEZ Boundary Lines']",
      content: $('#help-text-data-tour-layer').html(),
      direction: 'right',
      arrow: {offsetX: -10, offsetY: 10}
    },
    {
      target: '.layer div a.btn-info-sign',
      //target: 'div[name*="' + $('.layer').first().find('div').first().attr('name') + '"] a.btn-info-sign',
      content: $('#help-text-data-tour-info-sign').html(),
      direction: 'bottom',
      arrow: {offsetX: 10, offsetY: 0}
    }
  ]
};

var dataGuideOverrides = {
  events: {
    open: function () {
      app.pageguide.defaultOpenStuff();
    },
    close: function () { // activated regardless of whether the 'tour' was clicked  or the 'close' was clicked?
      app.pageguide.defaultCloseStuff();
    }
  },
  step: {
    events: {
      select: function() {
        if ($(this).data('idx') === 0) {
            app.viewModel.closeDescription();
            app.viewModel.deactivateAllLayers();
            //app.viewModel.closeAllThemes();
            //$('#pageGuideMessage').height(150);
        } else if ($(this).data('idx') === 1) {
            app.viewModel.closeDescription();
            app.viewModel.deactivateAllLayers();
            //app.viewModel.closeAllThemes();
            //$('#pageGuideMessage').height(150);
        } else if ($(this).data('idx') === 2) {
            //alert("Step 2");
            app.viewModel.closeDescription();
            app.viewModel.deactivateAllLayers();
            app.viewModel.closeAllThemes();
            app.viewModel.themes()[0].setOpenTheme();
            //$('#pageGuideMessage').css //can we adjust the height of the tour background as well as that of the description overlay?
            //$('#pageGuideMessage').height(150);
        } else if ($(this).data('idx') === 3) {
            //alert("Step 3");
            app.viewModel.closeDescription();
            app.viewModel.closeAllThemes();
            app.viewModel.themes()[0].setOpenTheme();
            var layer = app.viewModel.themes()[0].layers()[0];
            layer.activateLayer();
            //$('#pageGuideMessage').height(150);
        } else if ($(this).data('idx') === 4) {
            //$('#pageGuideMessage').height(150);
            app.viewModel.closeAllThemes();
            app.viewModel.themes()[0].setOpenTheme();
            var layer = app.viewModel.themes()[0].layers()[0];
            layer.showDescription(layer);
            //app.viewModel.themes()[0].layers()[3].showDescription(app.viewModel.themes()[0].layers()[3]);
            //$('#overview-overlay').height(236);
        }
      }
    }
  }
};

/* THE ACTIVE PANEL PAGE GUIDE */

var activeGuide = {
  id: 'active-guide',
  title: 'Active Guide',
  steps: [
    {
      target: '#activeTab',
      content: $('#help-text-active-tour-activeTab').html(),
      direction: 'top',
      arrow: {offsetX: 50, offsetY: 0}
    },
    {
      target: '.opacity-button',
      content: $('#help-text-active-tour-opacity-button').html(),
      direction: 'top',
      arrow: {offsetX: 25, offsetY: 0}
    },
    {
      target: '.ui-sortable',
      content: $('#help-text-active-tour-ui-sortable').html(),
      direction: 'bottom',
      arrow: {offsetX: 120, offsetY: 0}
    }
  ]
};

var activeGuideOverrides = {
  events: {
    open: function () {
        app.pageguide.defaultOpenStuff();
    },
    close: function () { // activated regardless of whether the 'tour' was clicked  or the 'close' was clicked?
      app.pageguide.defaultCloseStuff();
    }
  },
  step: {
    events: {
      select: function() {
        if ($(this).data('idx') === 0) {
            $('#activeTab').tab('show');
        } else if ($(this).data('idx') === 1) {
            $('#activeTab').tab('show');
            $('.opacity-button:first').click();
        } else if ($(this).data('idx') === 2) {
            $('#activeTab').tab('show');
        }
      }
    }
  }
};

app.pageguide.defaultOpenStuff = function() {
    app.pageguide.tourIsActive = true;  
    app.viewModel.hideMapAttribution();
    
    //increase the z-value of SimpleLayerSwitcher so it falls on top of the pageguide icon
    $('.SimpleLayerSwitcher').css('z-index', 1100);
};
app.pageguide.defaultCloseStuff = function() {
    app.viewModel.closeDescription();
    //if ( ! app.viewModel.showOverview() ) {
    app.viewModel.showMapAttribution();
    //}
    
    //for some reason it seems that the following 4 lines are needed both here and in the 'tour' click event handler
    app.viewModel.deactivateAllLayers();
    app.viewModel.closeAllThemes();
    
    //return the zindex of the SimpleLayerSwitcher to its original value
    $('.SimpleLayerSwitcher').css('z-index', 1020);
    
    //only save state if tour is activated from a normal (non-tour) state)
    //if tour is closing to start another tour, then don't resave/reload original state (wait till tours are closing rather than toggling)
    if ( ! app.pageguide.togglingTours ) {
      app.loadState(app.pageguide.state);
      app.saveStateMode = true;
    }
      
    $('#overview-overlay').height(186);
      
    app.pageguide.tourIsActive = false;
      
    $.pageguide(defaultGuide, defaultGuideOverrides);
};

$(function() {
  // Load the default guide!  
  $.pageguide(defaultGuide, defaultGuideOverrides);
  
  $('#help-tab').on('click', function() {
    if ( $.pageguide('isOpen') ) { // activated when 'tour' is clicked
        // close the pageguide
        $.pageguide('close');
        
        //restore the state to what it was before the tour
        app.loadState(app.pageguide.state);
        app.saveStateMode = true;
    } else {
        // start the pageguide 
        
        //show the data layers panel
        app.viewModel.showLayers(true);
      
        //save state
        app.pageguide.state = app.getState();
        app.saveStateMode = false;
         
        //start the tour
        setTimeout( function() { $.pageguide('open'); }, 200 );
      
    }
  });
  
  
});


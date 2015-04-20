app.init = function() {
    var max_zoom,
        min_zoom;
    //to turn basemap indicator off (hide the plus sign)
    //see email from Matt on 7/26 2:24pm with list of controls
    var map = new OpenLayers.Map(null, {
        //allOverlays: true,
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        projection: "EPSG:3857"
    });

    map.loadLayerProgress = new P97.Controls.LayerLoadProgress({
        map: map,
        element: $('#layer-loading-message'),
        onStartLoading: function() {
            if (this.element) {
                if ($("#loading").is(":visible")) {
                    this.element.hide();
                } else {
                    this.element.show();
                }
            }
        },
        onLoading: function(num, max, percentStr) {
            // this.element.text(percentStr);
        },
        onFinishLoading: function() {
            if (this.element && app.map.loadingVectorLayer !== true) {
                this.element.hide();
            }
        }
        
    });
    map.addControl(map.loadLayerProgress);

    map.onStartClustering = function() {
        app.map.loadingVectorLayer = true;
        app.map.loadLayerProgress.onStartLoading();
    }
    map.onFinishClustering = function() {
        app.map.loadingVectorLayer = false;
        app.map.loadLayerProgress.onFinishLoading();
    };

    if (app.MPSettings && app.MPSettings.max_zoom) {
        max_zoom = app.MPSettings.max_zoom + 1;
    } else {
        max_zoom = 13;
    }
    esriOcean = new OpenLayers.Layer.XYZ("ESRI Ocean","http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/${z}/${y}/${x}", {
        sphericalMercator: true,
        isBaseLayer: true,
        numZoomLevels: max_zoom,
        attribution: "Sources: Esri, GEBCO, NOAA, National Geographic, DeLorme, NAVTEQ, Geonames.org, and others",
        buffer: 3
    });
    // esriOcean = new OpenLayers.Layer.WMTS({
    //     name: "ESRI Ocean",
    //     url: "http://services.arcgisonline.com/arcgis/rest/services/Ocean_Basemap/MapServer/0",
    //     layer: 0
    // });

    openStreetMap = new OpenLayers.Layer.OSM("Open Street Map", "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png", {
        sphericalMercator: true,
        isBaseLayer: true,
        numZoomLevels: max_zoom,
        buffer: 3
    });
    googleStreet = new OpenLayers.Layer.Google("Google Streets", {
        sphericalMercator: true,
        isBaseLayer: true,
        numZoomLevels: max_zoom,
        buffer: 3
    });
    googleTerrain = new OpenLayers.Layer.Google("Google Physical", {
        type: google.maps.MapTypeId.TERRAIN,
        sphericalMercator: true,
        isBaseLayer: true,
        numZoomLevels: max_zoom,
        buffer: 3
    });
    googleSatellite = new OpenLayers.Layer.Google("Google Satellite", {
        type: google.maps.MapTypeId.SATELLITE,
        sphericalMercator: true,
        isBaseLayer: true,
        numZoomLevels: max_zoom,
        buffer: 3
    });

    /*var bingHybrid = new OpenLayers.Layer.Bing( {
        name: "Bing Hybrid",
        key: "AvD-cuulbvBqwFDQGNB1gCXDEH4S6sEkS7Yw9r79gOyCvd2hBvQYPaRBem8cpkjv",
        type: "AerialWithLabels",
        sphericalMercator: true,
        isBaseLayer: true,
        numZoomLevels: 13
    });*/

    // need api key from http://bingmapsportal.com/
    /*var bingHybrid = new OpenLayers.Layer.Bing({
        name: "Bing Hybrid",
        key: "AvD-cuulbvBqwFDQGNB1gCXDEH4S6sEkS7Yw9r79gOyCvd2hBvQYPaRBem8cpkjv",
        type: "AerialWithLabels"
    });*/
    nauticalCharts = new OpenLayers.Layer.WMS("Nautical Charts", "http://egisws02.nos.noaa.gov/ArcGIS/services/RNC/NOAA_RNC/ImageServer/WMSServer", {
        layers: 'null'
    }, {
        isBaseLayer: true,
        numZoomLevels: max_zoom,
        projection: "EPSG:3857",
        buffer: 3
    });

    map.addLayers([esriOcean, openStreetMap, googleStreet, googleTerrain, googleSatellite]); //, nauticalCharts]);

    //map.addLayers([esriOcean]);
    esriOcean.setZIndex(100);

    map.addControl(new SimpleLayerSwitcher());

    //Scale Bar
    var scalebar = new OpenLayers.Control.ScaleBar({
        displaySystem: "english",
        minWidth: 100, //default
        maxWidth: 150, //default
        divisions: 2, //default
        subdivisions: 2, //default
        showMinorMeasures: false //default
    });
    //map.addControl(scalebar);

    map.zoomBox = new OpenLayers.Control.ZoomBox({
        //enables zooming to a given extent on the map by holding down shift key while dragging the mouse
    });

    map.addControl(map.zoomBox);

    // only allow onetime zooming with box
    map.events.register("zoomend", null, function() {
        if (app.MPSettings && app.MPSettings.min_zoom) {
            min_zoom = app.MPSettings.min_zoom;
        } else {
            min_zoom = 3;
        }
        if (map.zoomBox.active) {
            app.viewModel.deactivateZoomBox();
        }
        if (map.getZoom() < min_zoom) {
            map.zoomTo(min_zoom);
        }
        
        app.removePopup();
    });

    map.events.register("moveend", null, function() {
        // update the url when we move
        app.updateUrl();
    });

    app.map = map;

    app.map.attributes = [];
    //app.map.clickOutput = { time: 0, attributes: [] };
    app.map.clickOutput = {
        time: 0,
        attributes: {}
    };

    //UTF Attribution
    map.UTFControl = new OpenLayers.Control.UTFGrid({
        //attributes: layer.attributes,
        layers: [],
        //events: {fallThrough: true},
        handlerMode: 'click',
        callback: function(infoLookup, lonlat, xy) {
            app.map.utfGridClickHandling(infoLookup, lonlat, xy);
        }
    });
    map.addControl(map.UTFControl);

    app.map.utfGridClickHandling = function(infoLookup, lonlat, xy) {
        var clickAttributes = [];
        // we should probably use another loop here to avoid the jshint on the next line
        for (var idx in infoLookup) {
            $.each(app.viewModel.visibleLayers(), function(layer_index, potential_layer) {
                if (potential_layer.type !== 'Vector') {
                    var new_attributes,
                        info = infoLookup[idx];
                    if (info && info.data) {
                        var newmsg = '',
                            hasAllAttributes = true,
                            parentHasAllAttributes = false;
                        // if info.data has all the attributes we're looking for
                        // we'll accept this layer as the attribution layer
                        //if ( ! potential_layer.attributes.length ) {
                        hasAllAttributes = false;
                        //}
                        $.each(potential_layer.attributes, function(attr_index, attr_obj) {
                            if (attr_obj.field in info.data) {
                                hasAllAttributes = true;
                            }
                        });
                        if (!hasAllAttributes && potential_layer.parent) {
                            parentHasAllAttributes = true;
                            if (!potential_layer.parent.attributes.length) {
                                parentHasAllAttributes = false;
                            }
                            $.each(potential_layer.parent.attributes, function(attr_index, attr_obj) {
                                if (!(attr_obj.field in info.data)) {
                                    parentHasAllAttributes = false;
                                }
                            });
                        }
                        if (hasAllAttributes) {
                            new_attributes = potential_layer.attributes;
                        } else if (parentHasAllAttributes) {
                            new_attributes = potential_layer.parent.attributes;
                        }
                        if (new_attributes) {
                            var attribute_objs = [];
                            $.each(new_attributes, function(index, obj) {
                                if (potential_layer.compress_attributes) {
                                    var display = obj.display + ': ' + info.data[obj.field];
                                    attribute_objs.push({
                                        'display': display,
                                        'data': ''
                                    });
                                } else {
                                    var value = info.data[obj.field];
                                    try {
                                        //set the precision and add any necessary commas
                                        value = value.toFixed(obj.precision).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                    } catch (e) {
                                        //keep on keeping on
                                    }
                                    attribute_objs.push({
                                        'display': obj.display,
                                        'data': value
                                    });
                                }
                            });
                            var title = potential_layer.name,
                                text = attribute_objs;
                            if (title === 'Wind Speed') {
                                text = app.viewModel.getWindSpeedAttributes(title, info.data);
                            }
                            clickAttributes[title] = text;
                            //app.viewModel.aggregatedAttributes(app.map.clickOutput.attributes);
                        }
                    }
                }
            });
            $.extend(app.map.clickOutput.attributes, clickAttributes);
            app.viewModel.aggregatedAttributes(app.map.clickOutput.attributes);
        }
        app.viewModel.updateMarker(lonlat);
        //app.marker.display(true);

    }; //end utfGridClickHandling

    app.map.events.register("featureclick", null, function(e) {
        var layer = e.feature.layer.layerModel || e.feature.layer.scenarioModel;
        var attrs;
        if (layer) {
            var text = [],
                title = layer.name;

            if (layer.scenarioAttributes && layer.scenarioAttributes.length) {
                attrs = layer.scenarioAttributes;
                for (var i = 0; i < attrs.length; i++) {
                    text.push({
                        'display': attrs[i].title,
                        'data': attrs[i].data
                    });
                }
            } else if (layer.attributes.length) {
                attrs = layer.attributes;

                for (var idx=0; idx < attrs.length; idx++) {
                    if (e.feature.data[attrs[idx].field]) {
                        text.push({
                            'display': attrs[idx].display,
                            'data': e.feature.data[attrs[idx].field]
                        });
                    }
                }
            }

            // the following delay prevents the #map click-event-attributes-clearing from taking place after this has occurred
            setTimeout(function() {
                app.map.clickOutput.attributes[title] = text;
                app.viewModel.aggregatedAttributes(app.map.clickOutput.attributes);
                app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(e.event.xy));
                //if (app.marker) {
                //    app.marker.display(true);
                //app.viewModel.updateMarker(lonlat);
                //}
            }, 100);

        }

    });

    app.markers = new OpenLayers.Layer.Markers("Markers");
    var size = new OpenLayers.Size(18, 28);
    var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
    app.markers.icon = new OpenLayers.Icon('/media/img/red-pin.png', size, offset);

    app.map.addLayer(app.markers);

    //no longer needed?
    //replaced with #map mouseup and move events in app.js?
    //place the marker on click events
    app.map.events.register("click", app.map, function(e) {
        //app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(e.xy));
        //the following is in place to prevent flash of marker appearing on what is essentially no feature click
        //display is set to true in the featureclick and utfgridclick handlers (when there is actually a hit)
        //app.marker.display(false);
    });

    app.map.removeLayerByName = function(layerName) {
        for (var i = 0; i < app.map.layers.length; i++) {
            if (app.map.layers[i].name === layerName) {
                app.map.removeLayer(app.map.layers[i]);
                i--;
            }
        }
    };

    app.utils = {};

    app.utils.pip = function(point, vs) {
        // substacks point in polygon
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        var x = point[0],
            y = point[1];

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0],
                yi = vs[i][1];
            var xj = vs[j][0],
                yj = vs[j][1];

            var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    };

    app.utils.isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    /** Regex: Find all sets of three digits from right to left, and insert ,'s
    \B match beginning of the word
    (?=(\d{3})+ followed by any number of sets of 3 digits (positive lookahead)
       (?!\d)) But not four (negative lookahead)
    Then, stick a , in front of them
    */
    app.utils.numberWithCommas = function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    app.utils.isInteger = function(n) {
        return app.utils.isNumber(n) && (Math.floor(n) === n);
    };

    app.utils.formatNumber = function(n) {
        var number = Number(n);
        var preciseNumber;
        if (app.utils.isInteger(number)) {
            preciseNumber = number.toFixed(0);
        } else {
            preciseNumber = number.toFixed(1);
        }
        return app.utils.numberWithCommas(preciseNumber);
    };

    app.utils.trim = function(str) {
        return str.replace(/^\s+|\s+$/g, '');
    };

    app.utils.getObjectFromList = function(list, field, value) {
        for (var i = 0; i < list.length; i += 1) {
            if (list[i][field] === value) {
                return list[i];
            }
        }
        return undefined;
    };

};

app.addLayerToMap = function(layer) {
    if (!layer.layer) {
        if (layer.utfurl || (layer.parent && layer.parent.utfurl)) {
            app.addUtfLayerToMap(layer);
        } else if (layer.type === 'Vector') {
            app.addVectorLayerToMap(layer);
        } else if (layer.type === 'ArcRest') {
            app.addArcRestLayerToMap(layer);
        } else if (layer.type === 'WMS') {
            app.addWmsLayerToMap(layer);
        } else { //if XYZ with no utfgrid
            app.addXyzLayerToMap(layer);
        }
    }

    app.map.addLayer(layer.layer);
    layer.layer.opacity = layer.opacity();
    layer.layer.setVisibility(true);

    // do we always have a filterTab no matter what? 
    if (app.viewModel.hasOwnProperty('filterTab')) {
        var filterLayerModels = app.viewModel.filterTab.filterLayers();
        var filterLayers = [];
        
        for (var i = 0; i < filterLayerModels.length; i++) {
            if (filterLayerModels[i].layer) {
                // .layer is undefined if the layer hasn't been turned on
                filterLayers.push(filterLayerModels[i].layer);
            }
        }

        if (!app.hasOwnProperty('filterableSelectFeatureControl')) {
            app.filterableSelectFeatureControl = new OpenLayers.Control.SelectFeature(filterLayers,
                {hover: false, autoActivate: true}
            );
            app.map.addControl(app.filterableSelectFeatureControl);
        }
        else {
            app.filterableSelectFeatureControl.setLayer(filterLayers);
        }
    }
};

// add XYZ layer with no utfgrid
app.addXyzLayerToMap = function(layer) {
    var opts = {
        displayInLayerSwitcher: false
    };

    var url = app.modifyURL(layer.url);

    // adding layer to the map for the first time
    layer.layer = new OpenLayers.Layer.XYZ(layer.name,
        url,
        $.extend({}, opts, {
            sphericalMercator: true,
            isBaseLayer: false //previously set automatically when allOverlays was set to true, must now be set manually
        })
    );
};

app.modifyURL = function(url) {
    var dateStringStart = url.search(new RegExp("{(y{2,4}|M{1,4}|d{1,4})+")),
        today = url.indexOf('{today}'),
        tomorrow = url.indexOf('{tomorrow}'),
        yesterday = url.indexOf('{yesterday}'),
        newURL = url;

    if (dateStringStart !== -1) {
        var dateStringEnd = url.indexOf('}', dateStringStart);
        var dateStringSpecifier = url.slice(dateStringStart + 1, dateStringEnd);
        var dateString = Date.today().toString(dateStringSpecifier);
        newURL = url.substr(0, dateStringStart) + dateString + url.substring(dateStringEnd + 1);
    }
    if (today !== -1) {
        today = newURL.indexOf('{today}');
        var todayEnd = newURL.indexOf('}', today);
        newURL = newURL.substr(0, today) + Date.today().toString("yyyy-MM-dd") + newURL.substr(todayEnd + 1);
    }
    if (tomorrow !== -1) {
        tomorrow = newURL.indexOf('{tomorrow}');
        var tomorrowEnd = newURL.indexOf('}', tomorrow);
        newURL = newURL.substr(0, tomorrow) + Date.today().add({
            days: 1
        }).toString("yyyy-MM-dd") + newURL.substr(tomorrowEnd + 1);
    }
    if (yesterday !== -1) {
        yesterday = newURL.indexOf('{yesterday}');
        var yesterdayEnd = newURL.indexOf('}', yesterday);
        newURL = newURL.substr(0, yesterday) + Date.today().add({
            days: -1
        }).toString("yyyy-MM-dd") + newURL.substr(yesterdayEnd + 1);
    }

    return newURL;
};


app.addWmsLayerToMap = function(layer) {

    layer.layer = new OpenLayers.Layer.WMS(layer.name, layer.url, {
        layers: layer.wms_slug,
        transparent: "true",
        format: "image/png"
    }, {
        // singleTile: true
        // 'buffer': 0
    });

    // map.addLayer(cables);

    // var url = app.modifyURL(layer.url);

    // layer.layer = new OpenLayers.Layer.WMS(
    //     "25M Depth Contour", "http://www.coastalatlas.net/services/wms/getmap",
    //     // layer.name,
    //     // url,
    //     {
    //         layers: "SubmarineCables_OFCC_2012",
    //         transparent: "true",
    //         format: "image/png"
    //     },
    //     {
    //         singleTile: true
    //     }
    // );

};

app.addArcRestLayerToMap = function(layer) {
    var identifyUrl = layer.url.replace('export', layer.arcgislayers + '/query');
    /*var esriQueryFields = [];
    for(var i = 0; i < layer.attributes.length; i++)
    {
      esriQueryFields.push(layer.attributes[i].display);
    }*/
    layer.arcIdentifyControl = new OpenLayers.Control.ArcGisRestIdentify({
        eventListeners: {
            //the handler for the return click data
            resultarrived: function(responseText, xy) {
                var clickAttributes = [],
                    jsonFormat = new OpenLayers.Format.JSON(),
                    returnJSON = jsonFormat.read(responseText.text);
                var attributeObjs;
                if (returnJSON.features && returnJSON.features.length) {
                    attributeObjs = [];

                    $.each(returnJSON.features, function(index, feature) {
                        if (index === 0) {
                            var attributeList = feature.attributes;

                            if ('fields' in returnJSON) {
                                if (layer.attributes.length) {
                                    for (var i = 0; i < layer.attributes.length; i += 1) {
                                        if (attributeList[layer.attributes[i].field]) {
                                            var data = attributeList[layer.attributes[i].field],
                                                field_obj = app.utils.getObjectFromList(returnJSON.fields, 'name', layer.attributes[i].field);
                                            if (field_obj && field_obj.type === 'esriFieldTypeDate') {
                                                data = new Date(data).toDateString();
                                            } else if (app.utils.isNumber(data)) {
                                                data = app.utils.formatNumber(data);
                                            }
                                            if (app.utils.trim(data) !== "") {
                                                attributeObjs.push({
                                                    'display': layer.attributes[i].display,
                                                    'data': data
                                                });
                                            }
                                        }
                                    }
                                } else {
                                    $.each(returnJSON.fields, function(fieldNdx, field) {
                                        if (field.name.indexOf('OBJECTID') === -1) {
                                            var data = attributeList[field.name];
                                            if (field.type === 'esriFieldTypeDate') {
                                                data = new Date(data).toDateString();
                                            } else if (app.utils.isNumber(data)) {
                                                data = app.utils.formatNumber(data);
                                            }
                                            if (app.utils.trim(data) !== "") {
                                                attributeObjs.push({
                                                    'display': field.alias,
                                                    'data': data
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                            return;
                        }
                    });
                }

                if (attributeObjs && attributeObjs.length) {
                    clickAttributes[layer.name] = attributeObjs;
                    $.extend(app.map.clickOutput.attributes, clickAttributes);
                    app.viewModel.aggregatedAttributes(app.map.clickOutput.attributes);
                    app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(responseText.xy));
                }
            }
        },
        url: identifyUrl,
        layerid: layer.arcgislayers,
        sr: 3857,
        clickTolerance: 2,
        //outFields : esriQueryFields.length ? esriQueryFields.join(',') : '*'
        outFields: '*'
    });
    /*
    layer.layer = new OpenLayers.Layer.ArcGIS93Rest(
        layer.name,
        layer.url,
        {
            layers: "show:"+layer.arcgislayers,
            srs: 'EPSG:102113',
            transparent: true
        },
        {
            isBaseLayer: false
        }
    );*/
    //2013-02-20 DWR
    //layer.layer.setVisibility(isVisible);
    //app.map.addLayer(layer.layer);
    //2013-02-20 DWR
    //ADd the identify control.
    //layer.identifyControl.activate();
    app.map.addControl(layer.arcIdentifyControl);



    layer.layer = new OpenLayers.Layer.ArcGIS93Rest(
        layer.name,
        layer.url, {
            layers: "show:" + layer.arcgislayers,
            srs: 'EPSG:3857',
            transparent: true
        }, {
            isBaseLayer: false
        }
    );
};


app.removePopup = function() {
    if (app.map.popup) {
        this.map.removePopup(app.map.popup);
        app.map.popup.destroy();
        app.map.popup = null; 
    }
};

app.createPointFilterLayer = function(layer) {
    var url = layer.url;
    if (layer.proxy_url) {
        url = '/proxy/layer/' + layer.id;
        if (layer.filter) {
            url += '?filter=' + layer.filter;
        }
    }

    // show Loading Layer message   
    app.map.loadingVectorLayer = true;     
    app.map.loadLayerProgress.onStartLoading();

    var defaultStyleContext = {
        context: {
            radius: function(feature) {
                var c; 
                if (defaultStyleContext.context.isDerelictGearFeature(feature)) {
                    c = defaultStyleContext.context.derelictGearValue(feature);
                }
                else {
                    c = defaultStyleContext.context.value(feature);
                }
                feature._radius = Math.max(10, 2 * Math.log(1 + c));
                return feature._radius;
            },
            value: function(feature) {
                var count = 0; 
                if (!feature.cluster) {
                    return 0; 
                }
                for (var i = 0; i < feature.cluster.length; i++) {
                    attr = feature.cluster[i].attributes;
                    if (app.viewModel.filterTab.countableName(attr.internal_name)) {
                        count += attr.count; 
                    }
                }
                return count; 
            },
            derelictGearValue: function(feature) {
                var count = 0; 
                if (!feature.cluster) {
                    return 0; 
                }
                return feature.cluster.length;
            },
            isDerelictGearFeature: function(feature) {
                try {
                    return feature.cluster[0].attributes.event_type == 'Derelict Gear Removal';
                } 
                catch (e) {
                    return false; 
                }
            },
            clusterLabel: function(feature) {
                if (defaultStyleContext.context.isDerelictGearFeature(feature)) {
                    return app.utils.numberWithCommas(defaultStyleContext.context.derelictGearValue(feature));
                }
                else {
                    return app.utils.numberWithCommas(defaultStyleContext.context.value(feature));
                }
            },
            getColor: function(feature) {
                var type = feature.cluster[0].attributes.event_type;
                return type === "Site Cleanup" ? "#BABA27" : "#ccc";
            },
            getStrokeColor: function(feature) {
                var type = feature.cluster[0].attributes.event_type;
                return type === "Site Cleanup" ? "#9A9A07" : "#333";
            }
        }
    };

    var defaultStyleData = {
        pointRadius: "${radius}",
        fillColor: "${getColor}",
        fillOpacity: 0.8,
        fontSize: 10,
        strokeColor: "${getStrokeColor}",
        strokeWidth: 2,
        strokeOpacity: 0.8,
        label: "${clusterLabel}",
        fontColor: "#333"
    };
    
    var defaultStyle = new OpenLayers.Style(defaultStyleData, 
                                            defaultStyleContext);

    var styleMap = new OpenLayers.StyleMap({
        "default": defaultStyle,
        "select": {
            fillColor: "#8aeeef",
            strokeColor: "#32a8a9"
        }
    });

    var eventListeners = {
        //** Compute popup contents, render, and display! 
        // TODO: Refactor; this is way too big. 
        'featureselected': function(e) {
            var maxItems = 5; // show at most 5 items in the popup
            var feature = e.feature;
            app.removePopup();
            
            var count = 0; 
            var sites = {};
            var categories = {};
            var gearType = {};
            var anyUncountable = false; // were any data fields excluded from the count? 
            var isDerelictGear = false;
            
            for (var i = 0; i < feature.cluster.length; i++) {
                var attr = feature.cluster[i].attributes;
            
                if (attr.event_type == 'Derelict Gear Removal') {
                    count++; 
                    if (gearType[attr.field_value]) {
                        gearType[attr.field_value]++;
                    }
                    else {
                        gearType[attr.field_value] = 1;
                    }
                }
                else {
                    if (app.viewModel.filterTab.countableName(attr.internal_name)) {
                        count += attr.count; 
                    }
                    else {
                        anyUncountable = true;
                    }
                    
                    if (categories[attr.internal_name]) {
                        categories[attr.internal_name] += attr.count;
                    }
                    else {
                        categories[attr.internal_name] = attr.count; 
                    }
                }

                if (sites[attr.displayName]) {
                    sites[attr.displayName]++;
                }
                else {
                    sites[attr.displayName] = 1;
                }
            }

            // hack
            if (Object.keys(gearType).length > 0 && Object.keys(categories).length == 0) {
                categories = gearType; 
                isDerelictGear = true;
            }
            
            
            // Populate the knockout
            // alias the really long object name
            var info = app.viewModel.filterTab.selectedClusterInfo;
            info.count(app.utils.numberWithCommas(count));
            info.anyUncountable(anyUncountable);
            // Convert the categories into an array of objects to make it easier
            // for to use in knockout
            var sortedCategories = Object.keys(categories).sort();
            info.categories.removeAll();
            for (var i = 0; i < sortedCategories.length; i++) {
                info.categories.push({
                    name: sortedCategories[i],
                    count: categories[sortedCategories[i]],
                    countable: isDerelictGear || app.viewModel.filterTab.countableName(sortedCategories[i])
                });
            }
            
            info.shortCategories.removeAll();
            for (var i = 0; i < sortedCategories.length && i < maxItems; i++) {
                info.shortCategories.push(info.categories()[i]);
            }
            if (i == maxItems && sortedCategories.length > maxItems) {
                info.moreCategories(sortedCategories.length - i); 
            }
            else {
                info.moreCategories(0);
            }


            var sortedSites = Object.keys(sites).sort();
            info.sites.removeAll();
            for (var i = 0; i < sortedSites.length; i++) {
                info.sites.push({
                    name: sortedSites[i],
                    count: sites[sortedSites[i]]
                });
            }
            
            info.shortSites.removeAll();
            for (var i = 0; i < sortedSites.length && i < maxItems; i++) {
                info.shortSites.push(info.sites()[i]);
            }
            if (i == maxItems && sortedSites.length > maxItems) {
                info.moreSites(sortedSites.length - i); 
            }
            else {
                info.moreSites(0);
            }
            // end populate knockout
            
            // Now that KO has done it's thing, make of copy of the HTML that
            // it generated for us and stuff that into the popup. 
            // I'm sure there's a better way to render this template.
            var html = document.querySelector('#selected-cluster-info').innerHTML;

            var popup = new OpenLayers.Popup.FramedCloud("popup" + feature.id,
                OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
                null,
                html,
                null,
                true, // close box
                null
            );
            popup.autoSize = true;
            popup.maxSize = new OpenLayers.Size(400,800);
            popup.fixedRelativePosition = true;
            
            app.map.popup = popup;
            app.map.addPopup(popup);

            // Scoot the anchor over a bit
            var theta = {
                tl: Math.PI, 
                tr: 0,
                bl: Math.PI,
                br: 0
            }[popup.relativePosition];
            popup.anchor.offset.x = Math.cos(theta) * feature._radius;
            popup.anchor.offset.y = Math.sin(theta) * feature._radius;
            popup.draw();
        },
        'featureunselected': function(e) {
            app.removePopup();
        },
        'loadend': function(e) {
            app.map.onFinishClustering();
        }
    }
    
    var newLayer = new OpenLayers.Layer.Vector("Events", {
        eventListeners: eventListeners,
        renderers: OpenLayers.Layer.Vector.prototype.renderers,
        projection: "EPSG:4326",
        strategies: [
            new OpenLayers.Strategy.Fixed(),
            // new OpenLayers.Strategy.AttributeCluster({
            new P97.Strategies.AttributeCluster({
                attribute: 'event_type',
                distance: 35,
                onStartClustering: app.map.onStartClustering,
                onFinishClustering: app.map.onFinishClustering
            })
        ],
        protocol: new OpenLayers.Protocol.HTTP({
            url: url,
            format: new OpenLayers.Format.GeoJSON(),
            params: {}
        }),
        styleMap: styleMap
    });
        
    return newLayer;
};

app.addGridSummaryLayerToMap = function(layer) {
    var url = layer.url;
    var dfd = new jQuery.Deferred();
    var breaks, scale = ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"];
    if (layer.proxy_url) {
        url = '/proxy/layer/' + layer.id;
    }
    if (!app.grid) {
        app.grid = {
            layers: {}
        };
    }

    var style = new OpenLayers.Style({
        fillColor: "${fillColor}",
        fillOpacity: 0.8
    }, {
        context: {
            fillColor: function(feature) {
                var color;
                if (breaks) {
                    $.each(breaks, function (i, b) {
                        if (feature.attributes.count <= b) {
                            color = scale[i];
                            return false;
                        }
                    });
                    return color;
                } else {
                    return scale[0];
                }

            }
        }
    });
    var styleMap = new OpenLayers.StyleMap();
    app.geojson_format = new OpenLayers.Format.GeoJSON();
    app.grid.grid_b_layer = new OpenLayers.Layer.Vector(
        'grid', {
            projection: new OpenLayers.Projection('EPSG:4326'), // 3857
            displayInLayerSwitcher: false,
            styleMap: new OpenLayers.StyleMap(style)
        }
    );
    app.map.addLayer(app.grid.grid_b_layer);
    var timer = new Date().getTime();
    $.when(
        $.get(url, function(data) {
            app.grid.layers[layer.id] = data;
        }),
        $.get('/media/data_manager/geojson/grid_west_coast.json', function(data) {
            app.grid.grid_b = data;
        })
    ).then(function() {
        var features = app.grid.layers[layer.id].features;
        var grid_features = app.grid.grid_b.features;
        var feature, geometry, grid_feature;
        var count = 0;
        var matches = {};
        var max = 0;
        for (var i = 0; i < features.length; i++) {
            for (var j = 0; j < grid_features.length; j++) {
                grid_feature = grid_features[j];
                if (app.utils.pip([features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]], grid_feature.geometry.coordinates[0])) {
                    if (grid_feature.properties.count) {
                        matches[j].attributes.count++;
                        if (matches[j].attributes.count > max) {
                            max = matches[j].attributes.count;
                        }
                    } else {
                        grid_feature.properties.count = 1;
                        count++;
                        geometry = app.geojson_format.read(grid_feature,
                            'Feature').geometry.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:3857"));
                        feature = new OpenLayers.Feature.Vector(geometry, {
                            count: 1
                        });
                        app.grid.grid_b_layer.addFeatures(feature);
                        matches[j] = feature;
                    }
                    break;
                }
            }
        }
        breaks = ss.jenks($.map(matches, function(item) {
            return item.attributes.count;
        }), 9);
        app.grid.grid_b_layer.redraw();
    });
    return app.grid.grid_b_layer;
};

app.addVectorLayerToMap = function(layer) {

    if (layer.type === 'Vector' && layer.summarize_to_grid) {
        layer.layer = app.addGridSummaryLayerToMap(layer);
        return;
    }

    if (layer.type === 'Vector' && layer.filterable) {
        layer.layer = app.createPointFilterLayer(layer);        
        var selectorControl = new OpenLayers.Control.SelectFeature(layer.layer, {
            hover: false,
            autoActivate: true
        });    
        app.map.addControl(selectorControl);
        return;
    }

    var url = layer.url,
        proj = layer.proj || 'EPSG:3857';
    var styleMap = new OpenLayers.StyleMap({
        fillColor: layer.color,
        fillOpacity: layer.fillOpacity,
        strokeColor: layer.color,
        strokeOpacity: layer.defaultOpacity,
        pointRadius: 2,
        externalGraphic: layer.graphic,
        graphicWidth: 15,
        graphicHeight: 15,
        graphicOpacity: layer.defaultOpacity
    });
    if (layer.proxy_url) {
        url = '/proxy/layer/' + layer.id;
    }

    if (layer.lookupField) {
        var mylookup = {};
        $.each(layer.lookupDetails, function(index, details) {
            var fillOp = 0.5;

            mylookup[details.value] = {
                strokeColor: details.color,
                strokeDashstyle: details.dashstyle,
                fill: details.fill,
                fillColor: details.color,
                fillOpacity: fillOp,
                externalGraphic: details.graphic
            };
        });
        styleMap.addUniqueValueRules("default", layer.lookupField, mylookup);
    }
    layer.layer = new OpenLayers.Layer.Vector(
        layer.name, {
            projection: new OpenLayers.Projection(proj), // 3857
            displayInLayerSwitcher: false,
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.HTTP({
                url: url,
                format: new OpenLayers.Format.GeoJSON()
            }),
            styleMap: styleMap,
            layerModel: layer
        }
    );
};


app.addUtfLayerToMap = function(layer) {
    var opts = {
        displayInLayerSwitcher: false
    };
    layer.utfgrid = new OpenLayers.Layer.UTFGrid({
        layerModel: layer,
        url: layer.utfurl ? layer.utfurl : layer.parent.utfurl,
        sphericalMercator: true,
        //events: {fallThrough: true},
        utfgridResolution: 4, // default is 2
        displayInLayerSwitcher: false,
        useJSONP: layer.utfjsonp
    });
    app.map.addLayer(layer.utfgrid);

    if (layer.type === 'ArcRest') {
        app.addArcRestLayerToMap(layer);
    } else if (layer.type === 'XYZ') {
        //maybe just call app.addXyzLayerToMap(layer)
        app.addXyzLayerToMap(layer);
    } else {
        //debugger;
    }
};

app.setLayerVisibility = function(layer, visibility) {
    // if layer is in openlayers, hide/show it
    if (layer.layer) {
        layer.layer.setVisibility(visibility);
    }
};

app.setLayerZIndex = function(layer, index) {
    layer.layer.setZIndex(index);
};


app.reCenterMap = function() {
    app.map.setCenter(new OpenLayers.LonLat(app.state.x, app.state.y).transform(
        new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913")), 7);
};

// block mousehweel when over overlay
$("#overview-overlay-text").hover(
    // mouseenter
    function() {
        var controls = app.map.getControlsByClass('OpenLayers.Control.Navigation');
        for (var i = 0; i < controls.length; ++i) {
            controls[i].disableZoomWheel();
        }

    },
    function() {
        var controls = app.map.getControlsByClass('OpenLayers.Control.Navigation');
        for (var i = 0; i < controls.length; ++i) {
            controls[i].enableZoomWheel();
        }
    }
);

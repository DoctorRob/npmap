﻿define(function() {
  var 
      // A queue of layers to load when the JSON files are loaded and ready to go.
      queue = [];
  
  /**
   *
   */
  function createGeometries(layer, json) {
    layer.geometries = [];

    if (layer.root) {
      json = json[layer.root];
    }

    _.each(json, function(v, i) {
      var d = {
            layerName: layer.name,
            layerType: 'Json'
          },
          o = {},
          m;
                
      function go() {
        if (layer.overIcon) {
          if (typeof layer.overIcon === 'string') {
            d.overIcon = layer.overIcon;
          } else {
            d.overIcon = layer.overIcon(d);
          }
        }

        m = NPMap.Map.createMarker(v[layer.lat] + ',' + v[layer.lng], o, d);
            
        layer.geometries.push(m);
        NPMap.Map.addShape(m);
      }
      
      _.each(v, function(v2, i2) {
        if (i2 !== layer.lat && i2 !== layer.lng) {
          d[i2] = v2;
        }
      });
            
      if (layer.icon) {
        if (typeof layer.icon === 'string') {
          o.icon = layer.icon;
        } else {
          o.icon = layer.icon(d);
        }

        // TODO: Should this apply to all APIs?
        if (NPMap.config.api === 'bing') {
          var image = new Image(),
              interval;
          
          image.src = o.icon;

          interval = setInterval(function() {
            if (image.height > 0 && image.width > 0) {
              clearInterval(interval);

              o.height = image.height;
              o.width = image.width;

              go();
            }
          }, 10);
        } else {
          go();
        }
      } else {
        go();
      }
    });
  }

  return NPMap.Layer.Json = {
    /**
     * This function gets called by the JSON file loaded via JSONP.
     * @param {Object} json
     * @return null
     */
    _callback: function(json) {
      function cycle() {
        var remove = [];
      
        for (var i = 0; i < queue.length; i++) {
          if (json.hasOwnProperty(queue[i].root)) {
            remove.push(i);
            createGeometries(queue[i], json);
          }
        }

        _.each(remove, function(v, i) {
          queue.splice(v, 1);
        });
      }

      if (queue.length > 0) {
        cycle();
      }
    },
    /**
     * Adds a Json layer to the map.
     * @return null
     */
    create: function(layer) {
      queue.push(layer);
      require([
        layer.url
      ]);
    },
    /**
     * Hides the Json layer.
     * @param {Object} The layer config object of the layer to hide.
     * @return null
     */
    hide: function(layer) {
      _.each(layer.geometries, function(v, i) {
        NPMap.Map.setMarkerOptions(v, {
          visible: false
        });
      });

      layer.visible = false;
    },
    /**
     * Removes the layer.
     * @param {Object} layer
     * @return null
     */
    remove: function(layer) {
    
    },
    /**
     * Shows the KML layer.
     * @param {Object} layer
     * @return null
     */
    show: function(layer) {
      _.each(layer.geometries, function(v) {
        NPMap.Map.setMarkerOptions(v, {
          visible: true
        });
      });

      layer.visible = true;
    }
  };
});
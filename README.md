# Marine Planner

Marine Planner is a lightweight map viewer and data catalog built using Django, Jquery, KnockoutJS, OpenLayers, and Twitter Bootstrap.  Marine Planner is designed to be easily configured and can be readily extended to support a broad range of marine planning activities including visualization, spatial design, and analysis using Madrona and other planning frameworks.

##Features
* Administrative interface for app configuration and management
 * Project name and logo
 * Default map extent and zoom level
 * User account and group management
 * ...and more
* Robust data layer management
 * Full support for OGC and ArcServer REST services (map, legend, feature query)
 * Automatically pull layer titles, descriptions, and supplementary links (metadata, data download, authoritative provider, etc.) or define your own
 * Add and organize layers into categories
 * Support for UTFGrid and GeoJSON layers
 * Filter and format feature query output for each layer
 * Automatic data catalog page built from your layer/category configuration
* Intuitive map interface
 * Layer reordering and opacity adjustment
 * Layer search bar
 * Bookmarks (client side storage)
 * Wide range of basemaps including nautical charts
 * Create map bookmarks and share them with others
 * Embed maps (including bookmarked views) into other pages
 * FullScreen map option
 * Support for tablet and mobile phone devices 
 * Simple Pageguide.js support for showing your users how to use the map

##Installation
Instructions for automated installation using Chef coming soon



### Local Installation without Vagrant
It appears that running this with Vagrant and Ansible is broken. The alternoative is to run this on your local machine in a Virtual Ennvironment. Here are some incomplete notes on this. 

See install docs here for how to install without Vagrant, Chef or Fab.

https://docs.google.com/a/pointnineseven.com/document/d/1wwHLZ7gsX-529xFg3b0KOfzXNE-IBhwxDaAtcb5LdsM/edit#

Additional Notes.

- You can install gdal from here http://www.kyngchaos.com/software/frameworks

- Sym link the osgeo library to your venv. 

- Run migrations. if you get an error go into psql and paste this.

```
insert into spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) 
values (99996, 'EPSG', 99996, 'Marco Albers', '+proj=aea +lat_1=37.25 +lat_2=40.25 +lat_0=36 +lon_0=-72 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs')
```

You also might need

```
CREATE OPERATOR CLASS gist_geometry_ops
FOR TYPE geometry USING GIST AS
STORAGE box2df,
OPERATOR        1        <<  ,
OPERATOR        2        &<  ,
OPERATOR        3        &&  ,
OPERATOR        4        &>  ,
OPERATOR        5        >>  ,
OPERATOR        6        ~=  ,
OPERATOR        7        ~  ,
OPERATOR        8        @  ,
OPERATOR        9        &<| ,
OPERATOR        10      <<| ,
OPERATOR        11      |>> ,
OPERATOR        12      |&> ,

OPERATOR        13      <-> FOR ORDER BY pg_catalog.float_ops,
OPERATOR        14      <#> FOR ORDER BY pg_catalog.float_ops,
FUNCTION        8        geometry_gist_distance_2d (internal, geometry, int4),

FUNCTION        1        geometry_gist_consistent_2d (internal, geometry, int4),
FUNCTION        2        geometry_gist_union_2d (bytea, internal),
FUNCTION        3        geometry_gist_compress_2d (internal),
FUNCTION        4        geometry_gist_decompress_2d (internal),
FUNCTION        5        geometry_gist_penalty_2d (internal, internal, internal),
FUNCTION        6        geometry_gist_picksplit_2d (internal, internal),
FUNCTION        7        geometry_gist_same_2d (geom1 geometry, geom2 geometry, internal);
```


See here form more info
https://docs.google.com/a/pointnineseven.com/document/d/1MbPbDp-Om1iIRb6bqhaKELqyU6x6E2KZ3Wm04tYAxak/edit


For some reason I could not get the media to serve with the Django server. So used a python server to serve media on port 8001. To start the server run the following command from the project root.


```
python scripts/cors-server.py 8001

```


Once installed run 

```


cd mp/
source PATH_TO_VENV/bin/activate
./manage runserver
```



##Questions
If you have questions, feature requests, etc, feel free to email us at marine-dev@ecotrust.org

Marine Planner is developed in partnership by Ecotrust and The Nature Conservancy



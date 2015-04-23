import json
import requests





URLS = [
    {
        'filters':['Plastic Bags'],
        'urls':[
            'http://debris.westcoastoceans.org/events/search?format=json&type=Site%20Cleanup&from=2012-04-13&to=2015-04-13&c=Plastic_bags',
            'http://127.0.0.1:8000/proxy/layer/312?filter=&concepts=Plastic_bags&from=2012-04-13&to=2015-04-13'
        ]
    },
    {
        'filters':['Plastic Bags Categories'],
        'urls':[
            'http://debris.westcoastoceans.org/events/search?format=json&type=Site%20Cleanup&from=2012-04-13&to=2015-04-13&c=Plastic_bags,Plastic_bags_grocery_shopping,Plastic_bags_trash,Plastic_bags_ziplock_snack',
            'http://127.0.0.1:8000/proxy/layer/312?filter=&categories=Plastic+Bags+Category&from=2012-04-13&to=2015-04-13'
        ]
    },
    {
        'filters':['Plastic Bags Grocery Shopping Trash'],
        'urls':[
            'http://debris.westcoastoceans.org/events/search?format=json&type=Site%20Cleanup&from=2012-04-13&to=2015-04-13',
            'http://127.0.0.1:8000/proxy/layer/312?filter=&from=2012-04-13&to=2015-04-13'
        ]
    },
    {
        'filters':['Plastic Bags Grocery Shopping'],
        'urls':[
            'http://debris.westcoastoceans.org/events/search?format=json&type=Site%20Cleanup&from=2012-04-13&to=2015-04-13&c=Plastic_bags_grocery_shopping',
            'http://127.0.0.1:8000/proxy/layer/312?filter=&concepts=Plastic_bags_grocery_shopping&from=2012-04-13&to=2015-04-13'
        ]
    },
    {
        'filters':['Plastic Bags Trash'],
        'urls':[
            'http://debris.westcoastoceans.org/events/search?format=json&type=Site%20Cleanup&from=2012-04-13&to=2015-04-13&c=Plastic_bags_trash',
            'http://127.0.0.1:8000/proxy/layer/312?filter=&concepts=Plastic_bags_trash&from=2012-04-13&to=2015-04-13'
        ]
    },
    {
        'filters': ['Plastic Bags Ziplock Snack'],
        'urls': [
            'http://debris.westcoastoceans.org/events/search?format=json&type=Site%20Cleanup&from=2012-04-13&to=2015-04-13&c=Plastic_bags_ziplock_snack',
            'http://127.0.0.1:8000/proxy/layer/312?filter=&concepts=Plastic_bags_ziplock_snack&from=2012-04-13&to=2015-04-13'
        ]
    },

    {
        'filters': ['Plastic Bags', 'Plastic Bags Grocery Shopping', 'Plastic Bags Trash'],
        'urls': [
            'http://debris.westcoastoceans.org/events/search?format=json&type=Site%20Cleanup&from=2012-04-13&to=2015-04-13&c=Plastic_bags,Plastic_bags_grocery_shopping,Plastic_bags_trash',
            'http://localhost:8000/proxy/layer/312?filter=&concepts=Plastic_bags_grocery_shopping%2CPlastic_bags_trash%2CPlastic_bags&from=2012-04-13&to=2015-04-13'
        ]
    },
    {
        'filters': ['Biohazard Category'],
        'urls': [
            'http://debris.westcoastoceans.org/events/search?format=json&type=Site%20Cleanup&from=2012-04-13&to=2015-04-13&c=Biohazard,Bandages,Syringes,Pet_waste,Condoms,Diapers,Feminine_products,Sanitary_items',
            'http://localhost:8000/proxy/layer/312?filter=&categories=Biohazard+Category&from=2012-04-13&to=2015-04-13'
        ]
    },
    {
        'filters': ['Biohazard'],
        'urls': [
            'http://debris.westcoastoceans.org/events/search?format=json&type=Site%20Cleanup&from=2012-04-13&to=2015-04-13&c=Biohazard',
            'http://localhost:8000/proxy/layer/312?filter=&concepts=Biohazard&from=2012-04-13&to=2015-04-13'
        ]
    },
    {
        'filters': ['Syringes'],
        'urls': [
            'http://debris.westcoastoceans.org/events/search?format=json&type=Site%20Cleanup&from=2012-04-13&to=2015-04-13&c=Syringes',
            'http://localhost:8000/proxy/layer/312?filter=&concepts=Syringes&from=2012-04-13&to=2015-04-13'
        ]
    },

    {
        'filters': ['Furniture Category'],
        'urls': [
            'http://debris.westcoastoceans.org/events/search?format=json&type=Site%20Cleanup&from=2012-04-13&to=2015-04-13&c=Furniture',
            'http://localhost:8000/proxy/layer/312?filter=&categories=Furniture+Category&from=2012-04-13&to=2015-04-13'
        ]
    }

]


def get_from_source(url):
    res = requests.get(url)
    str = "".join(res.text).replace("\n","")
    out = json.loads(str)
    return out



for obj in URLS:
    src_geojson = get_from_source(obj['urls'][0])
    proxy_geojson = get_from_source(obj['urls'][1])

    src_total = 0
    proxy_total = 0

    for f in proxy_geojson['features']:
        proxy_total += f['properties']['count']


    for f in src_geojson['features']:
        src_total += f['properties']['count']

    print obj['filters']
    print "SRC - Number of features ", len(src_geojson['features'])
    print "SRC - Total count ", src_total
    print "PROXY - Number of features ", len(proxy_geojson['features'])
    print "PROXY - Total count ", proxy_total

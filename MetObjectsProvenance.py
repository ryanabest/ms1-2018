import pandas as pd
import numpy as np

import warnings
warnings.filterwarnings('ignore')

import os
dir = os.path.dirname(__file__)

import io
import requests

import time
start_time = time.time()

from geotext import GeoText
import datefinder

"""
https://metmuseum.org/art/collection/search/435874
The House with the Cracked Walls by Paul Cézanne - beautiful painting with nice palette, detailed and expansive geographic provenance (Europe, Japan, NY, California, NY)



"""

# metObjectsUrl = 'https://media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv'
# metObjectsContent = requests.get(metObjectsUrl).content
# metObjectsFull = pd.read_csv(io.StringIO(metObjectsContent.decode('utf-8')))


metObjectsProvenanceJSON = os.path.join(dir, 'qual','assets','metObjectsProvenance.json')
metObjectsProvenance = pd.read_json(metObjectsProvenanceJSON)

## Sort Provenance List by Provenance Length Descending ##
metObjectsProvenance.index = metObjectsProvenance['provenance'].str.len()
metObjectsProvenance = metObjectsProvenance.sort_index(ascending=False).reset_index(drop=True)

print(metObjectsProvenance.iloc[5]['object_number'])
for y in metObjectsProvenance.iloc[5]['provenance'].split(';'):
    print(y.strip().replace("Leyden","Leiden"))
    places = GeoText(y.strip().replace("Leyden","Leiden"))
    print(places.cities)

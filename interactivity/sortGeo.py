import pandas as pd
import numpy as np

import warnings
warnings.filterwarnings('ignore')

import os
dir = os.path.dirname(__file__)

locationsGeoJSON = os.path.join(dir,'assets','locationsGeo.json')
locationsGeo = pd.read_json(locationsGeoJSON)
locationsGeo["lat"] = 0
locationsGeo["lon"] = 0
for index in locationsGeo.index.values:
    locationsGeo['lat'][index] = locationsGeo['coordinates'][index][0]
    locationsGeo['lon'][index] = locationsGeo['coordinates'][index][1]
    # print(locationsGeo['coordinates'][index][1])
locationsGeo = locationsGeo.sort_values(by=['lon']).reset_index()
locationsGeo = locationsGeo[['coordinates','location']]
locationsGeo.to_json(locationsGeoJSON)

import pandas as pd
import numpy as np

import warnings

# import datetime
# now = datetime.datetime.now()
#
import os
dir = os.path.dirname(__file__)

warnings.filterwarnings('ignore')

# Define data source variables
metObjectsUrl = 'https://media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv'
metObjectsCSV =         os.path.join(dir, 'assets','metObjects.csv')
# metObjectsStatic5000 =  os.path.join(dir, 'assets','MetObjects5000.csv')
# metObjectsImagesLinks = os.path.join(dir, 'assets','MMAImageURLS.xslx')


metObjectsFull = pd.read_csv(metObjectsCSV)

# print(metObjectsFull.head(15))
# print(metObjectsFull.tail(15))
print(metObjectsFull['Classification'].value_counts())

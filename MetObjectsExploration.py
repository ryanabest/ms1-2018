import pandas as pd
import numpy as np

import warnings
warnings.filterwarnings('ignore')

import datetime
now = datetime.datetime.now()

import os
dir = os.path.dirname(__file__)

import json

import requests
'''
baseURL = 'https://collectionapi.metmuseum.org/api/collection/v1/object/'
url = 'https://collectionapi.metmuseum.org/api/collection/v1/object/435572'
apiTest = requests.get(url)
apiJSON = json.loads(apiTest.content)
# apiDF = pd.read_json(apiTest.content)
print(apiJSON['media']['images']['primaryImage']['webImageUrl'])
'''

# Define data source variables
metObjectsUrl = 'https://media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv'
metObjectsCSV =         os.path.join(dir, 'assets','metObjects.csv')
# metObjectsStatic5000 =  os.path.join(dir, 'assets','MetObjects5000.csv')
metObjectsImages = os.path.join(dir, 'assets','MMAImageURLS.csv')


metObjectsFull = pd.read_csv(metObjectsCSV)
metObjectsImagesFull = pd.read_csv(metObjectsImages)

metObjectsFull = metObjectsFull.loc[metObjectsFull['Is Public Domain'],:]

### Sample of how matching text to images would work for art describes art ###
metObjectsWithImages = pd.merge(metObjectsFull,metObjectsImagesFull,on=['Object ID'],how='left')
imageBaseURL = 'https://images.metmuseum.org/CRDImages/as/web-large/'
imageSpecURL = str(metObjectsWithImages.loc[(metObjectsWithImages['Title'].notna()) & (metObjectsWithImages['Title'].str.lower().str.contains('contest')) & (metObjectsWithImages['Image File Name'].notna()),'Image File Name'].values[-1])
imageTitle = str(metObjectsWithImages.loc[(metObjectsWithImages['Title'].notna()) & (metObjectsWithImages['Title'].str.lower().str.contains('contest')) & (metObjectsWithImages['Image File Name'].notna()),'Title'].values[-1])
imageURL = imageBaseURL + imageSpecURL
# print(imageURL)
# print(imageTitle)
# print(metObjectsWithImages.loc[(metObjectsWithImages['Classification']=='Paintings') & (metObjectsWithImages['Department_x']=='European Paintings'),:])
print(metObjectsWithImages.loc[(metObjectsWithImages['Classification']=='Paintings'),'Department_x'].value_counts())

### Split up image into 100 pieces and print primary color for each, one row at a time ###
import image_slicer
# image_slicer.slice('/Users/ryanbest/Dropbox/GitHub/ms1-2018/qual/DP280846.jpg',100)

import colorthief
from colorthief import ColorThief

for j in range(10):
    # print(str(i+1).zfill(2))
    # print(str(j+1).zfill(2))
    color_thief = ColorThief('/Users/ryanbest/Dropbox/GitHub/ms1-2018/qual/DP280846_'+str(10).zfill(2)+'_'+str(j+1).zfill(2)+'.png')
    # print(color_thief.get_color(quality=1))
# color_thief = ColorThief('/Users/ryanbest/Dropbox/GitHub/ms1-2018/qual/DP280846_01_01.png')
# print(color_thief.get_color(quality=1))

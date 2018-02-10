import pandas as pd
import numpy as np

import warnings

import datetime
now = datetime.datetime.now()

warnings.filterwarnings('ignore')

# Define data source variables
metObjectsUrl = 'https://media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv'
metObjectsCSV = '/Users/ryanbest/Dropbox/ryanabest.github.io/ms1-2018/first-p5-vis/assets/MetObjects.csv'
metObjectsStatic5000 = '/Users/ryanbest/Dropbox/ryanabest.github.io/ms1-2018/first-p5-vis/assets/MetObjects5000.csv'
metObjectsImagesLinks = '/Users/ryanbest/Dropbox/ryanabest.github.io/ms1-2018/first-p5-vis/assets/MMAImageURLS.xslx'


metObjectsFull = pd.read_csv(metObjectsCSV,index_col=3)

metObjects = metObjectsFull[
    [
     'Object Number'
    ,'Department'
    ,'Object Name'
    ,'Title'
    ,'Artist Role'
    ,'Artist Display Name'
    ,'Artist Nationality'
    ,'Object Begin Date'
    ,'Object End Date'
    ,'Medium'
    ,'Credit Line'
    ,'Geography Type'
    ,'Country'
    ,'Classification'
    ]]

metObjects.columns = [
    'object_number'
   ,'department'
   ,'object_name'
   ,'title'
   ,'artist_role'
   ,'artist_display_name'
   ,'artist_nationality'
   ,'object_begin_date'
   ,'object_end_date'
   ,'medium'
   ,'credit_line'
   ,'geography_type'
   ,'country'
   ,'classification'
    ]

# acq_year population
metObjects['acq_year'] = metObjects['object_number'].str.split('.',1).str[0]
metObjects['acq_year'] = pd.to_numeric(metObjects['acq_year'],errors='coerce')
# 1970 y2k situation
metObjects.loc[metObjects['acq_year']<70, 'acq_year'] = metObjects['acq_year']+1900
metObjects.loc[(metObjects['acq_year']>=70) & (metObjects['acq_year']<100), 'acq_year'] = metObjects['acq_year']+1800
metObjects.loc[metObjects['acq_year']<1000, 'acq_year'] = pd.to_numeric(metObjects['credit_line'].str[-4:],errors='coerce')
metObjects.loc[metObjects['acq_year']>now.year, 'acq_year'] = pd.to_numeric(metObjects['credit_line'].str[-4:],errors='coerce')

# split between start and end year
metObjects['object_year'] = pd.to_numeric(metObjects['object_begin_date'])+(pd.to_numeric(metObjects['object_end_date']) - pd.to_numeric(metObjects['object_begin_date']))/2

print(metObjects['acq_year'].value_counts())

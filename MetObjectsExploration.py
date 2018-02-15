import pandas as pd
import numpy as np

import warnings

import datetime
now = datetime.datetime.now()

warnings.filterwarnings('ignore')

# Define data source variables
metObjectsUrl = 'https://media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv'
metObjectsCSV =         '/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/MetObjects.csv'
metObjectsStatic5000 =  '/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/MetObjects5000.csv'
metObjectsImagesLinks = '/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/MMAImageURLS.xslx'


metObjectsFull = pd.read_csv(metObjectsCSV,index_col=3)


metObjects = metObjectsFull[
    [
     'Object Number'
    ,'Artist Nationality'
    # ,'Object Begin Date'
    # ,'Object End Date'
    ,'Credit Line'
    ,'Country'
    ,'Classification'
    # ,'Artist Display Name'
    ,'Artist Display Bio'
    ,'Culture'
    ,'Object Name'
    ]]

metObjects.columns = [
    'object_number'
   ,'artist_nationality'
   # ,'object_begin_date'
   # ,'object_end_date'
   ,'credit_line'
   ,'country'
   ,'classification'
   # ,'artist_display_name'
   ,'artist_display_bio'
   ,'culture'
   ,'object_name'
    ]

# clear items without valid country or classification
# metObjects = metObjects.loc[metObjects['country'].isna()]

### Acquisition Year ###

# object number
metObjects['acq_year'] = metObjects['object_number'].str.split('.',1).str[0]
metObjects['acq_year'] = pd.to_numeric(metObjects['acq_year'],errors='coerce')
# 1970 y2k situation
metObjects.loc[metObjects['acq_year']<70, 'acq_year'] = metObjects['acq_year']+1900
metObjects.loc[(metObjects['acq_year']>=70) & (metObjects['acq_year']<100), 'acq_year'] = metObjects['acq_year']+1800
# if invalid year from object number, try credit line
metObjects.loc[metObjects['acq_year']<1000, 'acq_year'] = pd.to_numeric(metObjects['credit_line'].str[-4:],errors='coerce')
metObjects.loc[metObjects['acq_year']>now.year, 'acq_year'] = pd.to_numeric(metObjects['credit_line'].str[-4:],errors='coerce')


### Object Year ###

# split between start and end year
# metObjects['object_year'] = pd.to_numeric(metObjects['object_begin_date'])+(pd.to_numeric(metObjects['object_end_date']) - pd.to_numeric(metObjects['object_begin_date']))/2


### Classification ###

# use object_name when classification is null
metObjects.loc[metObjects['classification'].isna(),'classification'] = metObjects['object_name']
# take first classification listed
metObjects['classification'] = metObjects['classification'].str.split('|',1).str[0]
metObjects['classification'] = metObjects['classification'].str.split('-',1).str[0]
metObjects['classification'] = metObjects['classification'].str.split(',',1).str[0]
metObjects['classification'] = metObjects['classification'].str.split('(',1).str[0]
metObjects.loc[metObjects['credit_line']=='The Jefferson R. Burdick Collection, Gift of Jefferson R. Burdick','classification'] = metObjects['classification'] + '-Burdick Collection'
metObjects['classification'] = metObjects['classification'].str.strip()


### Country ###

# clean and standardize country
metObjects['country'] = metObjects['country'].str.split('|',1).str[0]
metObjects['country'] = metObjects['country'].str.split(',',1).str[0]
metObjects['country'] = metObjects['country'].str.split('(',1).str[0]
metObjects['country'] = metObjects['country'].str.split('?',1).str[0]
metObjects['country'] = metObjects['country'].str.replace('probably','')
metObjects['country'] = metObjects['country'].str.replace('possibly','')
metObjects['country'] = metObjects['country'].str.replace('present-day','')
metObjects['country'] = metObjects['country'].str.strip()


## Artist Nationality ##
# clean and standardize nationality
metObjects['artist_nationality'] = metObjects['artist_nationality'].str.split('|',1).str[0]
metObjects['artist_nationality'] = metObjects['artist_nationality'].str.split(',',1).str[0]
metObjects['artist_nationality'] = metObjects['artist_nationality'].str.split('(',1).str[0]
metObjects['artist_nationality'] = metObjects['artist_nationality'].str.replace('?','')
metObjects['artist_nationality'] = metObjects['artist_nationality'].str.strip()

# assign country to artist_nationality where country is null
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Roman'),'country'] = 'Roman Empire'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='French'),'country'] = 'France'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='American'),'country'] = 'United States'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Italian'),'country'] = 'Italy'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='British'),'country'] = 'England'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Japanese'),'country'] = 'Japan'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='German'),'country'] = 'Germany'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Netherlandish'),'country'] = 'Netherlands'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Dutch'),'country'] = 'Netherlands'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Spanish'),'country'] = 'Spain'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Austrian'),'country'] = 'Austria'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Scottish'),'country'] = 'Scotland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Chinese'),'country'] = 'China'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Russian'),'country'] = 'Russia'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Swiss'),'country'] = 'Switzerland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Swedish'),'country'] = 'Sweden'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Irish'),'country'] = 'Ireland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Hungarian'),'country'] = 'Hungary'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Mexican'),'country'] = 'Mexico'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Belgian'),'country'] = 'Belgium'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Canadian'),'country'] = 'Canada'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Danish'),'country'] = 'Denmark'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Czech'),'country'] = 'Czech Republic'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Indian'),'country'] = 'India'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Finnish'),'country'] = 'Finland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Greek'),'country'] = 'Greece'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Polish'),'country'] = 'Poland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Australian'),'country'] = 'Australia'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Norwegian'),'country'] = 'Norway'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Israeli'),'country'] = 'Israel'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Flemish'),'country'] = 'Belgium' # https://en.wikipedia.org/wiki/Flemish_people
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_nationality']=='Bohemian'),'country'] = 'Czech Republic' # https://en.wikipedia.org/wiki/Bohemia


## Artist Display Bio ##
# clean and standardize artist_display_bio
metObjects['artist_display_bio'] = metObjects['artist_display_bio'].str.split('|',1).str[0]
metObjects['artist_display_bio'] = metObjects['artist_display_bio'].str.split(',',1).str[0]
metObjects['artist_display_bio'] = metObjects['artist_display_bio'].str.split('(',1).str[0]
metObjects['artist_display_bio'] = metObjects['artist_display_bio'].str.strip()

# assign country to country in artist_display_bio where country and artist_nationality are both null
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Roman'),'country'] = 'Roman Empire'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='French'),'country'] = 'France'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='American'),'country'] = 'United States'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Italian'),'country'] = 'Italy'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='British'),'country'] = 'England'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Japanese'),'country'] = 'Japan'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='German'),'country'] = 'Germany'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Netherlandish'),'country'] = 'Netherlands'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Dutch'),'country'] = 'Netherlands'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Spanish'),'country'] = 'Spain'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Austrian'),'country'] = 'Austria'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Scottish'),'country'] = 'Scotland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Chinese'),'country'] = 'China'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Russian'),'country'] = 'Russia'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Swiss'),'country'] = 'Switzerland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Swedish'),'country'] = 'Sweden'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Irish'),'country'] = 'Ireland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Hungarian'),'country'] = 'Hungary'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Mexican'),'country'] = 'Mexico'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Belgian'),'country'] = 'Belgium'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Canadian'),'country'] = 'Canada'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Danish'),'country'] = 'Denmark'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Czech'),'country'] = 'Czech Republic'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Indian'),'country'] = 'India'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Finnish'),'country'] = 'Finland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Greek'),'country'] = 'Greece'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Polish'),'country'] = 'Poland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Australian'),'country'] = 'Australia'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Norwegian'),'country'] = 'Norway'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Israeli'),'country'] = 'Israel'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Flemish'),'country'] = 'Belgium' # https://en.wikipedia.org/wiki/Flemish_people
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Bohemian'),'country'] = 'Czech Republic' # https://en.wikipedia.org/wiki/Bohemia
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='New York and Durham'),'country'] = 'United States'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='Philadelphia'),'country'] = 'United States'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['artist_display_bio']=='New York'),'country'] = 'American'


## Culture ##
# clean and standardize culture
metObjects['culture'] = metObjects['culture'].str.split('|',1).str[0]
metObjects['culture'] = metObjects['culture'].str.split(',',1).str[0]
metObjects['culture'] = metObjects['culture'].str.split('(',1).str[0]
metObjects['culture'] = metObjects['culture'].str.replace('probably','')
metObjects['culture'] = metObjects['culture'].str.replace('possibly','')
metObjects['culture'] = metObjects['culture'].str.strip()

# assign country to country in culture where artist_display_bio, country, and artist_nationality are all null
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Roman'),'country'] = 'Roman Empire'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='French'),'country'] = 'France'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='American'),'country'] = 'United States'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Italian'),'country'] = 'Italy'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='British'),'country'] = 'England'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Japanese'),'country'] = 'Japan'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='German'),'country'] = 'Germany'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Netherlandish'),'country'] = 'Netherlands'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Dutch'),'country'] = 'Netherlands'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Spanish'),'country'] = 'Spain'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Austrian'),'country'] = 'Austria'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Scottish'),'country'] = 'Scotland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Chinese'),'country'] = 'China'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Russian'),'country'] = 'Russia'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Swiss'),'country'] = 'Switzerland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Swedish'),'country'] = 'Sweden'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Irish'),'country'] = 'Ireland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Hungarian'),'country'] = 'Hungary'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Mexican'),'country'] = 'Mexico'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Belgian'),'country'] = 'Belgium'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Canadian'),'country'] = 'Canada'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Danish'),'country'] = 'Denmark'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Czech'),'country'] = 'Czech Republic'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Indian'),'country'] = 'India'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Finnish'),'country'] = 'Finland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Greek'),'country'] = 'Greece'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Polish'),'country'] = 'Poland'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Australian'),'country'] = 'Australia'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Norwegian'),'country'] = 'Norway'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Israeli'),'country'] = 'Israel'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Flemish'),'country'] = 'Belgium' # https://en.wikipedia.org/wiki/Flemish_people
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Bohemian'),'country'] = 'Czech Republic' # https://en.wikipedia.org/wiki/Bohemia
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='China'),'country'] = 'China'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Japan'),'country'] = 'Japan'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Cypriot'),'country'] = 'Cyprus'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='India'),'country'] = 'India'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Iran'),'country'] = 'Iran'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Indonesia'),'country'] = 'Indonesia'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Etruscan'),'country'] = 'Italy' # https://en.wikipedia.org/wiki/Etruscan_civilization
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Sasanian'),'country'] = 'Iran' # https://en.wikipedia.org/wiki/Sasanian_Empire
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Minoan'),'country'] = 'Greek' # https://en.wikipedia.org/wiki/Minoan_civilization
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Korea'),'country'] = 'Korea'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Thailand'),'country'] = 'Thailand'
metObjects.loc[(metObjects['country'].isna()) & (metObjects['culture']=='Babylonian'),'country'] = 'Iraq' # https://en.wikipedia.org/wiki/Babylon


# clean country specific duplicates
metObjects.loc[(metObjects['country']=='United States of America') | (metObjects['country']=='US') | (metObjects['country']=='USA') | (metObjects['country']=='America') | (metObjects['country']=='American'),'country'] = 'United States'
metObjects.loc[(metObjects['country']=='Holland') | (metObjects['country']=='The Netherlands'),'country'] = 'Netherlands'
metObjects.loc[(metObjects['country']=='Greek') | (metObjects['country']=='The Netherlands'),'country'] = 'Greece'
metObjects.loc[(metObjects['country']=='United Kingdom'),'country'] = 'England'

metObjects['country'] = metObjects['country'].str.split('or',1).str[0]
metObjects['country'] = metObjects['country'].str.split('|',1).str[0]
metObjects['country'] = metObjects['country'].str.split(',',1).str[0]
metObjects['country'] = metObjects['country'].str.split('(',1).str[0]
metObjects['country'] = metObjects['country'].str.split('?',1).str[0]
metObjects['country'] = metObjects['country'].str.replace('probably','')
metObjects['country'] = metObjects['country'].str.replace('Probably','')
metObjects['country'] = metObjects['country'].str.replace('possibly','')
metObjects['country'] = metObjects['country'].str.replace('Possibly','')
metObjects['country'] = metObjects['country'].str.replace('present-day','')
metObjects['country'] = metObjects['country'].str.replace('Northern','')
metObjects['country'] = metObjects['country'].str.replace('Southern','')
metObjects['country'] = metObjects['country'].str.replace('Western','')
metObjects['country'] = metObjects['country'].str.replace('Eastern','')
metObjects['country'] = metObjects['country'].str.replace('northern','')
metObjects['country'] = metObjects['country'].str.replace('southern','')
metObjects['country'] = metObjects['country'].str.replace('western','')
metObjects['country'] = metObjects['country'].str.replace('eastern','')
metObjects['country'] = metObjects['country'].str.strip()

# coverage check
# print(len(metObjects.loc[(metObjects['country'].notna()) & (metObjects['acq_year'].notna()) & (metObjects['classification'].notna()),:]))
# print(len(metObjects.loc[(metObjects['country'].isna()) | (metObjects['acq_year'].isna()) | (metObjects['classification'].isna()),:]))

metObjectsExport = metObjects[['acq_year','classification','country']]

### Nulls ###

# replace null acqusition_year, classification, and country with 'unknown' values
metObjectsExport.loc[metObjectsExport['classification']=='',    'classification'] = 'Unknown'
metObjectsExport.loc[metObjectsExport['classification'].isna(), 'classification'] = 'Unknown'
# print(metObjects['classification'].value_counts())
metObjectsExport.loc[metObjectsExport['acq_year'].isna(), 'acq_year'] = 10000
# print(metObjects['acq_year'].value_counts())
metObjectsExport.loc[metObjectsExport['country']=='',    'country'] = 'Unknown'
metObjectsExport.loc[metObjectsExport['country'].isna(), 'country'] = 'Unknown'
# print(metObjects['country'].value_counts())
'''
# limit individual classifications labels to only those with above 5k works in the collection
metObjectsExport['classification_full'] = metObjectsExport['classification']
# this part seems to take FOREVER - what could be a more efficient way to group all unpopular classifications that this?
metClassList = metObjectsExport.groupby(['classification']).size().reset_index()
metClassList.columns = ['classification','object_count']
droppedClassifications = metClassList.loc[metClassList['object_count']<5000,:]['classification'].unique()
for c in droppedClassifications:
    metObjectsExport.loc[metObjectsExport['classification']==c,'classification'] = 'Other'
'''
## Export to JSON for Aggregation in separate process ##
metObjectsExport.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/metObjects.json')
# countries = pd.DataFrame(metObjects['country'].value_counts())
# print(countries.loc[countries['country']<110])

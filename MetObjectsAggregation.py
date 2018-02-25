#### MetObjectsAggregation ####
import pandas as pd
import numpy as np

import warnings

import datetime
now = datetime.datetime.now()

warnings.filterwarnings('ignore')

# Define global variables
metObjectsJSON = '/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/metObjects.json'
countryNumber = 10 # How many countries do we wnat to list out individually in each year? The rest will go into an 'other' catch-all
classificationNumber = 5 # How many classifications do we want to break out within each country (and list with overall totals) each year? The rest will go into an 'other' catch-all

# Load JSON from data cleaning script
metObjects = pd.read_json(metObjectsJSON)

### Aggregation ###

## Year ##
aggYear = metObjects.sort_values(['acq_year'], ascending=[True]) \
                    .groupby(['acq_year']).size().reset_index()
aggYear.columns = ['acq_year','object_count']
aggYear['object_cum_count'] = aggYear['object_count'].cumsum()

## Country ##
aggCountry = metObjects.groupby(['country']).size().reset_index()
aggCountry.columns = ['country','object_count']
aggCountry = aggCountry.sort_values(['object_count'],ascending=[False])
aggCountry['object_count_rank'] = aggCountry.loc[aggCountry['country']!='Unknown/Other','object_count'].rank(ascending=False,method='dense')
aggCountry.loc[aggCountry['object_count_rank']>countryNumber,'country'] = 'Unknown/Other'
aggCountry = pd.DataFrame(aggCountry.groupby(['country'])['object_count'].sum()).sort_values('object_count',ascending=False).reset_index()
aggCountry.loc[aggCountry['country']!='Unknown/Other','object_count_rank'] = aggCountry.loc[aggCountry['country']!='Unknown/Other','object_count'].rank(ascending=False,method='dense')

## Country and Classification ##
topCountryList = metObjects.loc[metObjects['country']!='Unknown/Other','country'].value_counts().head(countryNumber).index.tolist()

aggCountryClassificationFull = metObjects.groupby(['country','classification']).size().reset_index()
aggCountryClassificationFull.columns = ['country','classification','object_count']
aggCountryClassificationFull.loc[~aggCountryClassificationFull['country'].isin(topCountryList),'country'] = 'Unknown/Other'
aggCountryClassificationFull = pd.DataFrame(aggCountryClassificationFull.groupby(['country','classification'])['object_count'].sum().reset_index())

aggCountryClassificationFull = aggCountryClassificationFull.assign(object_count_rank = aggCountryClassificationFull.groupby(['country'])['object_count'].rank(method='min', ascending=False))
aggCountryClassificationFull.loc[aggCountryClassificationFull['object_count_rank']>classificationNumber,'classification'] = 'Other'
aggCountryClassification = pd.DataFrame(aggCountryClassificationFull.groupby(['country','classification'])['object_count'].sum().reset_index())
aggCountryClassification = aggCountryClassification.assign(object_count_rank = aggCountryClassification.groupby(['country'])['object_count'].rank(method='min',ascending=False))

## Year and Country ##
aggYearCountryFull = metObjects.groupby(['acq_year','country']).size().reset_index()
aggYearCountryFull.columns = ['acq_year','country','object_count']
aggYearCountryFull.loc[~aggYearCountryFull['country'].isin(topCountryList),'country'] = 'Unknown/Other'
aggYearCountryFull = pd.DataFrame(aggYearCountryFull.groupby(['acq_year','country'])['object_count'].sum().reset_index())

aggYearCountryFull['object_cum_count'] = aggYearCountryFull.sort_values(['acq_year'], ascending=[True]) \
                                                           .groupby(['country']) \
                                                           ['object_count'].apply(lambda x: x.cumsum())

aggYearCountry = []
for x in aggYearCountryFull.loc[:,:]['acq_year'].unique():
    for c in aggYearCountryFull.loc[(aggYearCountryFull['acq_year']<=x),:]['country'].unique():
        aggYearCountry.append({
             'acq_year'         :x
            ,'country'          :c
            ,'object_count'     :aggYearCountryFull.loc[(aggYearCountryFull['acq_year']==x) & (aggYearCountryFull['country']==c),'object_count'].sum()
            ,'object_cum_count' :aggYearCountryFull.loc[(aggYearCountryFull['acq_year']<=x) & (aggYearCountryFull['country']==c),'object_cum_count'].values[-1]
        })
aggYearCountry = pd.DataFrame(aggYearCountry)

aggYearCountry.loc[aggYearCountry['country']!='Unknown/Other','object_count_rank'] = aggYearCountry.loc[aggYearCountry['country']!='Unknown/Other',:] \
                                                                                                   .sort_values(['object_count'], ascending=[False]) \
                                                                                                   .groupby(['acq_year']) \
                                                                                                   .cumcount() + 1

aggYearCountry.loc[aggYearCountry['country']!='Unknown/Other','object_cum_count_rank'] = aggYearCountry.loc[aggYearCountry['country']!='Unknown/Other',:] \
                                                                                                       .sort_values(['object_cum_count'], ascending=[False]) \
                                                                                                       .groupby(['acq_year']) \
                                                                                                       .cumcount() + 1


## Year and Classification ##
aggYearClassificationFull = metObjects.groupby(['acq_year','classification']).size().reset_index()
aggYearClassificationFull.columns = ['acq_year','classification','object_count']
topClassificationList = metObjects.loc[metObjects['classification']!='Unknown/Other','classification'].value_counts().head(classificationNumber).index.tolist()
aggYearClassificationFull.loc[~aggYearClassificationFull['classification'].isin(topClassificationList),'classification'] = 'Unknown/Other'
aggYearClassificationFull = pd.DataFrame(aggYearClassificationFull.groupby(['acq_year','classification'])['object_count'].sum().reset_index())

aggYearClassificationFull['object_cum_count'] = aggYearClassificationFull.sort_values(['acq_year'], ascending=[True]) \
                                                                        .groupby(['classification']) \
                                                                        ['object_count'].apply(lambda x: x.cumsum())

aggYearClassification = []
for x in aggYearClassificationFull.loc[:,:]['acq_year'].unique():
    for c in aggYearClassificationFull.loc[(aggYearClassificationFull['acq_year']<=x),:]['classification'].unique():
        aggYearClassification.append({
             'acq_year'         :x
            ,'classification'   :c
            ,'object_count'     :aggYearClassificationFull.loc[(aggYearClassificationFull['acq_year']==x) & (aggYearClassificationFull['classification']==c),'object_count'].sum()
            ,'object_cum_count' :aggYearClassificationFull.loc[(aggYearClassificationFull['acq_year']<=x) & (aggYearClassificationFull['classification']==c),'object_cum_count'].values[-1]
        })
aggYearClassification = pd.DataFrame(aggYearClassification)

aggYearClassification.loc[aggYearClassification['classification']!='Unknown/Other','object_count_rank'] = aggYearClassification.loc[aggYearClassification['classification']!='Unknown/Other',:] \
                                                                                                                               .sort_values(['object_count'], ascending=[False]) \
                                                                                                                               .groupby(['acq_year']) \
                                                                                                                               .cumcount() + 1

aggYearClassification.loc[aggYearClassification['classification']!='Unknown/Other','object_cum_count_rank'] = aggYearClassification.loc[aggYearClassification['classification']!='Unknown/Other',:] \
                                                                                                                                   .sort_values(['object_cum_count'], ascending=[False]) \
                                                                                                                                   .groupby(['acq_year']) \
                                                                                                                                   .cumcount() + 1

## Year, Country, and Classification ##
aggYearCountryClassificationFull = metObjects.groupby(['acq_year','country','classification']).size().reset_index()
aggYearCountryClassificationFull.columns = ['acq_year','country','classification','object_count']
aggYearCountryClassificationFull.loc[~aggYearCountryClassificationFull['country'].isin(topCountryList),'country'] = 'Unknown/Other'
aggYearCountryClassificationFull = pd.DataFrame(aggYearCountryClassificationFull.groupby(['acq_year','country','classification'])['object_count'].sum().reset_index())
aggYearCountryClassificationJoin = pd.merge(aggYearCountryClassificationFull,aggCountryClassification,on=['country','classification'],how='left')
aggYearCountryClassificationJoin.loc[pd.isna(aggYearCountryClassificationJoin['object_count_rank']),'classification'] = 'Other'
aggYearCountryClassificationJoin = pd.DataFrame(aggYearCountryClassificationJoin.groupby(['acq_year','country','classification'])['object_count_x'].sum().reset_index())

aggYearCountryClassificationJoin['object_cum_count'] = aggYearCountryClassificationJoin.sort_values(['acq_year'],ascending=[True]) \
                                                                                       .groupby(['country','classification']) \
                                                                                       ['object_count_x'].apply(lambda x: x.cumsum())


# print(aggYearCountryClassificationFull.loc[(aggYearCountryClassificationFull['acq_year']<=2017) & (aggYearCountryClassificationFull['country']=='United States') & (aggYearCountryClassificationFull['classification']=='Prints-Burdick Collection'),'object_cum_count'].values[-1])
# print(aggYearCountryClassificationFull.loc[(aggYearCountryClassificationFull['classification']=='Prints-Burdick Collection') & (aggYearCountryClassificationFull['country']=='United States'),:].sort_values('acq_year',ascending=True))

aggYearCountryClassification = []
for x in aggYearCountryClassificationJoin['acq_year'].unique():
    for c in aggYearCountryClassificationJoin.loc[(aggYearCountryClassificationJoin['acq_year']<=x),:]['country'].unique():
        for l in aggYearCountryClassificationJoin.loc[(aggYearCountryClassificationJoin['acq_year']<=x) & (aggYearCountryClassificationJoin['country']==c),:]['classification'].unique():
            aggYearCountryClassification.append({
                 'acq_year'                :x
                ,'country'                 :c
                ,'classification'          :l
                ,'object_cum_count'        :aggYearCountryClassificationJoin.loc[(aggYearCountryClassificationJoin['acq_year']<=x) & (aggYearCountryClassificationJoin['country']==c) & (aggYearCountryClassificationJoin['classification']==l),'object_cum_count'].values[-1]
            })
aggYearCountryClassification = pd.DataFrame(aggYearCountryClassification)
aggYearCountryClassification = aggYearCountryClassification.assign(object_cum_count_rank = aggYearCountryClassification.groupby(['acq_year','country'])['object_cum_count'].rank(method='min',ascending=False))
aggYearCountryClassification = pd.merge(aggYearCountryClassification,aggCountry,on='country',how='left')
aggYearCountryClassification = pd.merge(aggYearCountryClassification,aggYearCountry,on=['country','acq_year'],how='left')
aggYearCountryClassification = pd.merge(aggYearCountryClassification,aggCountryClassification,on=['country','classification'],how='left')
aggYearCountryClassification = aggYearCountryClassification[['acq_year','classification','country','object_cum_count_x','object_cum_count_rank_x','object_count_x','object_count_rank_x','object_cum_count_y','object_count_rank']]
aggYearCountryClassification.columns = ['acq_year','classification','country','object_cum_count','object_cum_count_rank','country_total_object_count','country_total_object_count_rank','country_year_object_cum_count','country_classification_object_count_rank']
aggYearCountryClassification = aggYearCountryClassification.sort_values(['acq_year','country','country_classification_object_count_rank'],ascending=[True,True,True])

# print(aggYearCountry.loc[(aggYearCountry['acq_year']==1963) & (aggYearCountry['country']=='United States'),'object_cum_count'].sum())
# print(aggYearCountryClassification.loc[(aggYearCountryClassification['acq_year']==2017) & (aggYearCountryClassification['country']=='United States'),'object_cum_count'].sum())

# print(aggCountry)
# print(aggYearCountry.loc[(aggYearCountry['acq_year']==2017),:].sort_values('object_cum_count_rank',ascending=True))
# print(aggYearClassification.loc[(aggYearClassification['acq_year']==2017),:].sort_values('object_cum_count_rank',ascending=True))
# print(aggYearCountryClassification.loc[(aggYearCountryClassification['acq_year']==2017) & (aggYearCountryClassification['country']=='United States'),:].sort_values('object_cum_count',ascending=False))


## Separate Unknown/Other into their own data frames ##
aggCountryClassificationOther = pd.DataFrame(aggCountryClassification.loc[aggCountryClassification['country']=='Unknown/Other'].reset_index())
aggCountryClassification = pd.DataFrame(aggCountryClassification.loc[aggCountryClassification['country']!='Unknown/Other'].reset_index())
aggYearCountryOther = pd.DataFrame(aggYearCountry.loc[aggYearCountry['country']=='Unknown/Other'].reset_index())
aggYearCountry = pd.DataFrame(aggYearCountry.loc[aggYearCountry['country']!='Unknown/Other'].reset_index())
aggYearClassificationOther = pd.DataFrame(aggYearClassification.loc[aggYearClassification['classification']=='Unknown/Other'].reset_index())
aggYearClassification = pd.DataFrame(aggYearClassification.loc[aggYearClassification['classification']!='Unknown/Other'].reset_index())
aggYearCountryClassificationOther = pd.DataFrame(aggYearCountryClassification.loc[aggYearCountryClassification['country']=='Unknown/Other'].reset_index())
aggYearCountryClassification = pd.DataFrame(aggYearCountryClassification.loc[aggYearCountryClassification['country']!='Unknown/Other'].reset_index())

## Export JSONs ##
aggYear.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggYear.json')
aggCountry.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggCountry.json')
aggCountryClassification.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggCountryClassification.json')
aggYearCountry.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggYearCountry.json')
aggYearCountryOther.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggYearCountryOther.json')
aggCountryClassificationOther.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggCountryClassificationOther.json')
aggYearClassification.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggYearClassification.json')
aggYearClassificationOther.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggYearClassificationOther.json')
aggYearCountryClassification.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggYearCountryClassification.json')
aggYearCountryClassificationOther.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggYearCountryClassificationOther.json')

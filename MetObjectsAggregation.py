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
metObjects = metObjects.loc[metObjects['country']!='Unknown']

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
aggCountry['object_count_rank'] = aggCountry['object_count'].rank(ascending=False,method='dense')
aggCountry.loc[aggCountry['object_count_rank']>countryNumber,'country'] = 'Other'
aggCountry = pd.DataFrame(aggCountry.groupby(['country'])['object_count'].sum()).sort_values('object_count',ascending=False)
aggCountry['object_count_rank'] = aggCountry['object_count'].rank(ascending=False,method='dense')

## Year and Country ##
aggYearCountryFull = metObjects.groupby(['acq_year','country']).size().reset_index()
aggYearCountryFull.columns = ['acq_year','country','object_count']
topCountryList = metObjects.loc[metObjects['country']!='Unknown','country'].value_counts().head(countryNumber).index.tolist()
aggYearCountryFull.loc[~aggYearCountryFull['country'].isin(topCountryList),'country'] = 'Other'
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

aggYearCountry['object_count_rank'] = aggYearCountry.sort_values(['object_count'], ascending=[False]) \
                                                    .groupby(['acq_year']) \
                                                    .cumcount() + 1

aggYearCountry['object_cum_count_rank'] = aggYearCountry.sort_values(['object_cum_count'], ascending=[False]) \
                                                        .groupby(['acq_year']) \
                                                        .cumcount() + 1

## Year and Classification ##
aggYearClassificationFull = metObjects.groupby(['acq_year','classification']).size().reset_index()
aggYearClassificationFull.columns = ['acq_year','classification','object_count']
topClassificationList = metObjects.loc[metObjects['classification']!='Unknown','classification'].value_counts().head(classificationNumber).index.tolist()
aggYearClassificationFull.loc[~aggYearClassificationFull['classification'].isin(topClassificationList),'classification'] = 'Other'
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

aggYearClassification['object_count_rank'] = aggYearClassification.sort_values(['object_count'], ascending=[False]) \
                                                                  .groupby(['acq_year']) \
                                                                  .cumcount() + 1

aggYearClassification['object_cum_count_rank'] = aggYearClassification.sort_values(['object_cum_count'], ascending=[False]) \
                                                                      .groupby(['acq_year']) \
                                                                      .cumcount() + 1

## Year, Country, and Classification ##
aggYearCountryClassificationFull = metObjects.groupby(['acq_year','country','classification']).size().reset_index()
aggYearCountryClassificationFull.columns = ['acq_year','country','classification','object_count']
aggYearCountryClassificationFull.loc[~aggYearCountryClassificationFull['country'].isin(topCountryList),'country'] = 'Other'
aggYearCountryClassificationFull.loc[~aggYearCountryClassificationFull['classification'].isin(topClassificationList),'classification'] = 'Other'
aggYearCountryClassificationFull = pd.DataFrame(aggYearCountryClassificationFull.groupby(['acq_year','country','classification'])['object_count'].sum().reset_index())

aggYearCountryClassificationFull['country_count'] = aggYearCountryClassificationFull.groupby(['acq_year','country'])['object_count'].transform(np.sum)
aggYearCountryClassificationFull['classification_count'] = aggYearCountryClassificationFull.groupby(['acq_year','classification'])['object_count'].transform(np.sum)

aggYearCountryClassificationFull['object_cum_count'] = aggYearCountryClassificationFull.sort_values(['acq_year'],ascending=[True]) \
                                                                                       .groupby(['country','classification']) \
                                                                                       ['object_count'].apply(lambda x: x.cumsum())

aggYearCountryClassificationFull['country_cum_count'] = aggYearCountryClassificationFull.sort_values(['acq_year'],ascending=[True]) \
                                                                                        .groupby(['country']) \
                                                                                        ['object_count'].apply(lambda x: x.cumsum())

aggYearCountryClassificationFull['classification_cum_count'] = aggYearCountryClassificationFull.sort_values(['acq_year'],ascending=[True]) \
                                                                                               .groupby(['classification']) \
                                                                                               ['object_count'].apply(lambda x: x.cumsum())

aggYearCountryClassification = []
for x in aggYearCountryClassificationFull.loc[:,:]['acq_year'].unique():
    for c in aggYearCountryClassificationFull.loc[(aggYearCountryClassificationFull['acq_year']<=x),:]['country'].unique():
        for l in aggYearCountryClassificationFull.loc[(aggYearCountryClassificationFull['acq_year']<=x) & (aggYearCountryClassificationFull['country']==c),:]['classification'].unique():
            aggYearCountryClassification.append({
                 'acq_year'                :x
                ,'country'                 :c
                ,'classification'          :l
                ,'object_count'            :aggYearCountryClassificationFull.loc[(aggYearCountryClassificationFull['acq_year']==x) & (aggYearCountryClassificationFull['country']==c) & (aggYearCountryClassificationFull['classification']==l),'object_count'].sum()
                ,'object_cum_count'        :aggYearCountryClassificationFull.loc[(aggYearCountryClassificationFull['acq_year']<=x) & (aggYearCountryClassificationFull['country']==c) & (aggYearCountryClassificationFull['classification']==l),'object_cum_count'].values[-1]
                ,'country_count'           :aggYearCountryClassificationFull.loc[(aggYearCountryClassificationFull['acq_year']==x) & (aggYearCountryClassificationFull['country']==c)]['country_count'].mean()
                ,'country_cum_count'       :aggYearCountryClassificationFull.loc[(aggYearCountryClassificationFull['acq_year']<=x) & (aggYearCountryClassificationFull['country']==c)]['country_cum_count'].values[-1]
                ,'classification_count'    :aggYearCountryClassificationFull.loc[(aggYearCountryClassificationFull['acq_year']==x) & (aggYearCountryClassificationFull['classification']==l)]['country_count'].mean()
                ,'classification_cum_count':aggYearCountryClassificationFull.loc[(aggYearCountryClassificationFull['acq_year']<=x) & (aggYearCountryClassificationFull['classification']==l)]['country_cum_count'].values[-1]
            })
aggYearCountryClassification = pd.DataFrame(aggYearCountryClassification)

aggYearCountryClassification['object_count_rank'] = aggYearCountryClassification.sort_values(['object_count'], ascending=[False]) \
                                                                                .groupby(['acq_year']) \
                                                                                .cumcount() + 1

aggYearCountryClassification['object_cum_count_rank'] = aggYearCountryClassification.sort_values(['object_cum_count'], ascending=[False]) \
                                                                                    .groupby(['acq_year']) \
                                                                                    .cumcount() + 1

aggYearCountryClassification['country_count_rank'] = aggYearCountryClassification.sort_values(['country_count'], ascending=[False]) \
                                                                                .groupby(['acq_year']) \
                                                                                .cumcount() + 1

aggYearCountryClassification['country_cum_count_rank'] = aggYearCountryClassification.sort_values(['country_cum_count'], ascending=[False]) \
                                                                                    .groupby(['acq_year']) \
                                                                                    .cumcount() + 1

aggYearCountryClassification['classification_count_rank'] = aggYearCountryClassification.sort_values(['classification_count'], ascending=[False]) \
                                                                                .groupby(['acq_year']) \
                                                                                .cumcount() + 1

aggYearCountryClassification['classification_cum_count_rank'] = aggYearCountryClassification.sort_values(['classification_cum_count'], ascending=[False]) \
                                                                                    .groupby(['acq_year']) \
                                                                                    .cumcount() + 1


## Export JSONs ##
aggYear.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggYear.json')
aggCountry.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggCountry.json')
aggYearCountry.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggYearCountry.json')
aggYearClassification.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggYearClassification.json')
aggYearCountryClassification.to_json('/Users/ryanbest/Dropbox/GitHub/ms1-2018/first-p5-vis/assets/aggYearCountryClassification.json')

'''
## Year and Classification ##
aggYearClassFull = metObjects.groupby(['acq_year','classification_full']).size().reset_index()
aggYearClassFull.columns = ['acq_year','classification','object_count']


# https://stackoverflow.com/questions/22650833/pandas-groupby-cumulative-sum
aggYearClassFull['object_cum_count'] = aggYearClassFull.sort_values(['acq_year'], ascending=[True]) \
                                               .groupby(['classification']) \
                                               ['object_count'].apply(lambda x: x.cumsum())


aggYearClassPersist = []
for x in aggYearClassFull.loc[:,:]['acq_year'].unique():
    for c in aggYearClassFull.loc[(aggYearClassFull['acq_year']<=x),:]['classification'].unique():
        aggYearClassPersist.append({
             'acq_year':x
            ,'classification':c
            ,'object_count':aggYearClassFull.loc[(aggYearClassFull['acq_year']<=x) & (aggYearClassFull['classification']==c),'object_count'].values[-1]
            ,'object_cum_count':aggYearClassFull.loc[(aggYearClassFull['acq_year']<=x) & (aggYearClassFull['classification']==c),'object_cum_count'].values[-1]
        })
aggYearClassPersist = pd.DataFrame(aggYearClassPersist)



# https://stackoverflow.com/questions/35905335/aggregation-over-partition-pandas-dataframe
# aggYearClassPersist['object_count_rank'] = aggYearClassPersist.sort_values(['object_count'], ascending=[False]) \
#                                                                .groupby(['acq_year']) \
#                                                                .cumcount() + 1

aggYearClassPersist['object_count_rank'] = aggYearClassPersist.sort_values(['object_count'], ascending=[False]) \
                                                              .groupby(['acq_year']) \
                                                              .cumcount() + 1

aggYearClassPersist['object_cum_count_rank'] = aggYearClassPersist.sort_values(['object_cum_count'], ascending=[False]) \
                                                                  .groupby(['acq_year']) \
                                                                  .cumcount() + 1

# aggregate all classifications below top n on aggregate count from that year into 'other' category
aggYearClass = []
for x in aggYearClassPersist['acq_year'].unique():
    aggYearClass.append({
         'acq_year':x
        ,'classification':'Other'
        ,'object_count':     aggYearClassPersist.loc[(aggYearClassPersist['acq_year']==x) & (aggYearClassPersist['object_cum_count_rank']>classificationNumber),:]['object_count'].sum()
        ,'object_cum_count': aggYearClassPersist.loc[(aggYearClassPersist['acq_year']==x) & (aggYearClassPersist['object_cum_count_rank']>classificationNumber),:]['object_cum_count'].sum()
        ,'object_count_rank':np.nan
        ,'object_cum_count_rank':classificationNumber+1
    })
aggYearClass = pd.DataFrame(aggYearClass)

# union 'other' classifications with those at or above the top n in cumulative totals that year
aggYearClass = pd.concat([aggYearClassPersist.loc[(aggYearClassPersist['object_cum_count_rank']<=classificationNumber)],aggYearClass], ignore_index=True)


'''
'''
## Year and Classification ##
aggYearClassFull = metObjects.groupby(['acq_year','classification']).size().reset_index()
aggYearClassFull.columns = ['acq_year','classification','object_count']


# https://stackoverflow.com/questions/22650833/pandas-groupby-cumulative-sum
aggYearClassFull['object_cum_count'] = aggYearClassFull.sort_values(['acq_year'], ascending=[True]) \
                                               .groupby(['classification']) \
                                               ['object_count'].apply(lambda x: x.cumsum())


aggYearClassPersist = []
for x in aggYearClassFull.loc[:,:]['acq_year'].unique():
    for c in aggYearClassFull.loc[(aggYearClassFull['acq_year']<=x),:]['classification'].unique():
        aggYearClassPersist.append({
             'acq_year':x
            ,'classification':c
            ,'object_count':aggYearClassFull.loc[(aggYearClassFull['acq_year']<=x) & (aggYearClassFull['classification']==c),'object_count'].values[-1]
            ,'object_cum_count':aggYearClassFull.loc[(aggYearClassFull['acq_year']<=x) & (aggYearClassFull['classification']==c),'object_cum_count'].values[-1]
        })
aggYearClassPersist = pd.DataFrame(aggYearClassPersist)



# https://stackoverflow.com/questions/35905335/aggregation-over-partition-pandas-dataframe
# aggYearClassPersist['object_count_rank'] = aggYearClassPersist.sort_values(['object_count'], ascending=[False]) \
#                                                                .groupby(['acq_year']) \
#                                                                .cumcount() + 1

aggYearClassPersist.loc[aggYearClassPersist['classification']!='Other','object_count_rank'] = aggYearClassPersist.loc[aggYearClassPersist['classification']!='Other',:].sort_values(['object_count'], ascending=[False]) \
                                                                                                                                                                    .groupby(['acq_year']) \
                                                                                                                                                                    .cumcount() + 1

aggYearClassPersist.loc[aggYearClassPersist['classification']!='Other','object_cum_count_rank'] = aggYearClassPersist.loc[aggYearClassPersist['classification']!='Other',:].sort_values(['object_cum_count'], ascending=[False]) \
                                                                                                                                                                        .groupby(['acq_year']) \
                                                                                                                                                                       .cumcount() + 1

# aggregate all classifications below top n on aggregate count from that year into 'other' category
aggYearClass = []
for x in aggYearClassPersist['acq_year'].unique():
    aggYearClass.append({
         'acq_year':x
        ,'classification':'Other'
        ,'object_count':     aggYearClassPersist.loc[(aggYearClassPersist['acq_year']==x) & ((aggYearClassPersist['object_cum_count_rank']>classificationNumber) | (aggYearClassPersist['classification']=='Other')),:]['object_count'].sum()
        ,'object_cum_count': aggYearClassPersist.loc[(aggYearClassPersist['acq_year']==x) & ((aggYearClassPersist['object_cum_count_rank']>classificationNumber) | (aggYearClassPersist['classification']=='Other')),:]['object_cum_count'].sum()
        ,'object_count_rank':np.nan
        ,'object_cum_count_rank':classificationNumber+1
    })
aggYearClass = pd.DataFrame(aggYearClass)

# union 'other' classifications with those at or above the top n in cumulative totals that year
aggYearClass = pd.concat([aggYearClassPersist.loc[(aggYearClassPersist['object_cum_count_rank']<=classificationNumber)],aggYearClass], ignore_index=True)
'''
'''
## Year and Country ##
aggYearCountryFull = metObjects.groupby(['acq_year','country']).size().reset_index()
aggYearCountryFull.columns = ['acq_year','country','object_count']
topCountryList = metObjects.loc[metObjects['country']!='Unknown','country'].value_counts().head(countryNumber).index.tolist()
aggYearCountryFull.loc[~aggYearCountryFull['country'].isin(topCountryList),'country'] = 'Other'
aggYearCountryFull = pd.DataFrame(aggYearCountryFull.groupby(['acq_year','country'])['object_count'].sum().reset_index())

aggYearCountryFull['object_cum_count'] = aggYearCountryFull.sort_values(['acq_year'], ascending=[True]) \
                                                   .groupby(['country']) \
                                                   ['object_count'].apply(lambda x: x.cumsum())

aggYearCountry = []
for x in aggYearCountryFull.loc[:,:]['acq_year'].unique():
    for c in aggYearCountryFull.loc[(aggYearCountryFull['acq_year']<=x),:]['country'].unique():
        aggYearCountry.append({
             'acq_year':x
            ,'country':c
            ,'object_count':aggYearCountryFull.loc[(aggYearCountryFull['acq_year']<=x) & (aggYearCountryFull['country']==c),'object_count'].values[-1]
            ,'object_cum_count':aggYearCountryFull.loc[(aggYearCountryFull['acq_year']<=x) & (aggYearCountryFull['country']==c),'object_cum_count'].values[-1]
        })
aggYearCountry = pd.DataFrame(aggYearCountry)

aggYearCountry['object_count_rank'] = aggYearCountry.sort_values(['object_count'], ascending=[False]) \
                                                    .groupby(['acq_year']) \
                                                    .cumcount() + 1

aggYearCountry['object_cum_count_rank'] = aggYearCountry.sort_values(['object_cum_count'], ascending=[False]) \
                                                        .groupby(['acq_year']) \
                                                        .cumcount() + 1
''''''
# aggregate all countries below top n on aggregate count from that year into 'other' category
aggYearCountry = []
for x in aggYearCountryPersist['acq_year'].unique():
    aggYearCountry.append({
         'acq_year':x
        ,'country':'Other'
        ,'object_count':aggYearCountryPersist.loc[(aggYearCountryFull['acq_year']==x) & (aggYearCountryPersist['object_cum_count_rank']>countryNumber),:]['object_count'].sum()
        ,'object_cum_count':aggYearCountryPersist.loc[(aggYearCountryFull['acq_year']==x) & (aggYearCountryPersist['object_cum_count_rank']>countryNumber),:]['object_cum_count'].sum()
        ,'object_count_rank':np.nan
        ,'object_cum_count_rank':countryNumber+1
    })
aggYearCountry = pd.DataFrame(aggYearCountry)
# aggYearCountry = aggYearCountry.loc[(aggYearCountry['object_count']!=0) & (aggYearCountry['object_cum_count']!=0),:]

# union 'other' countries with those at or above the top n in cumulative totals that year
aggYearCountry = pd.concat([aggYearCountryPersist.loc[aggYearCountryPersist['object_cum_count_rank']<=countryNumber],aggYearCountry], ignore_index=True)
'''
'''
## Year, Country, and Classification ##
aggYearCountryClassFull = metObjects.groupby(['acq_year','country','classification']).size().reset_index()
aggYearCountryClassFull.columns = ['acq_year','country','classification','object_count']

aggYearCountryClassFull['object_cum_count'] = aggYearCountryClassFull.sort_values(['acq_year'], ascending=[True]) \
                                                                     .groupby(['classification','country']) \
                                                                     ['object_count'].apply(lambda x: x.cumsum())

aggYearCountryClassPersist = []
for x in aggYearCountryClassFull.loc[:,:]['acq_year'].unique():
    for c in aggYearCountryClassFull.loc[(aggYearCountryClassFull['acq_year']<=x),:]['country'].unique():
        for l in aggYearCountryClassFull.loc[(aggYearCountryClassFull['acq_year']<=x) & (aggYearCountryClassFull['country']==c),:]['classification'].unique():
            aggYearCountryPersist.append({
                 'acq_year':x
                ,'country':c
                ,'classification': l
                ,'object_count':aggYearCountryClassFull.loc[(aggYearCountryClassFull['acq_year']<=x) & (aggYearCountryClassFull['country']==c) & (aggYearCountryClassFull['classification']==l),'object_count'].values[-1]
                ,'object_cum_count':aggYearCountryClassFull.loc[(aggYearCountryClassFull['acq_year']<=x) & (aggYearCountryClassFull['country']==c) & (aggYearCountryClassFull['classification']==l),'object_cum_count'].values[-1]
            })
aggYearCountryClassPersist = pd.DataFrame(aggYearCountryClassPersist)

aggYearCountryClassPersist['object_count_rank'] = aggYearCountryClassPersist.sort_values(['object_count'], ascending=[False]) \
                                                                  .groupby(['acq_year']) \
                                                                  .cumcount() + 1

aggYearCountryClassPersist['object_cum_count_rank'] = aggYearCountryClassPersist.sort_values(['object_cum_count'], ascending=[False]) \
                                                                      .groupby(['acq_year']) \
                                                                      .cumcount() + 1


aggYearCountryClassPersist['object_count_rank_country'] = aggYearCountryClassPersist.sort_values(['object_count'], ascending=[False]) \
                                                                  .groupby(['acq_year','country']) \
                                                                  .cumcount() + 1

aggYearCountryClassPersist['object_cum_count_rank_country'] = aggYearCountryClassPersist.sort_values(['object_cum_count'], ascending=[False]) \
                                                                      .groupby(['acq_year,country']) \
                                                                      .cumcount() + 1

aggYearCountryClassPersist['object_count_rank_classification'] = aggYearCountryClassPersist.sort_values(['object_count'], ascending=[False]) \
                                                                  .groupby(['acq_year','classification']) \
                                                                  .cumcount() + 1

aggYearCountryClassPersist['object_cum_count_rank_classification'] = aggYearCountryClassPersist.sort_values(['object_cum_count'], ascending=[False]) \
                                                                      .groupby(['acq_year,classification']) \
                                                                      .cumcount() + 1
'''
### PRINT OUTPUTS ###
# print(aggYearCountryFull)
# print(aggYearCountry)
# print(metObjects.loc[metObjects['country']!='Unknown','country'].value_counts().head(countryNumber).index.tolist())

# print(aggYear.loc[:,['acq_year','object_count']])
# print(aggYearClassification.groupby('acq_year')['object_count'].sum())

# print(aggYearCountry.loc[aggYearCountry['acq_year']==1984,:].sort_values('object_count_rank',ascending=True))

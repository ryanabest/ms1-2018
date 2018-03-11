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


# Define data source variables
# metObjectsStatic5000 =  os.path.join(dir, 'assets','MetObjects5000.csv')

## URL ##
metObjectsUrl = 'https://media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv'
metObjectsContent = requests.get(metObjectsUrl).content
metObjectsFull = pd.read_csv(io.StringIO(metObjectsContent.decode('utf-8')))

## CSV ##
# metObjectsCSV =  os.path.join(dir,'..','assets','metObjects.csv')
# metObjectsFull = pd.read_csv(metObjectsCSV)

## Images ##
metObjectsImagesJSON = os.path.join(dir,'..','assets','MMAImageURLS.csv')
metObjectsImages = pd.read_csv(metObjectsImagesJSON)
metObjectsImages = metObjectsImages.loc[metObjectsImages['PrimaryDisplay']==1,:]
metObjectsImages = metObjectsImages[['Object ID','URL']]
metObjectsImages.columns=['object_number','image_url']


metObjectsFull = metObjectsFull.loc[metObjectsFull['Is Public Domain'],:]
metObjectsFull = metObjectsFull.loc[metObjectsFull['Classification']=='Paintings',:]
metObjectsFull = metObjectsFull.sort_values('Object ID',ascending=True)
# # print(metObjectsFull['Classification'].value_counts())
#

metObjectsVanGogh = metObjectsFull.loc[metObjectsFull['Artist Display Name']=='Vincent van Gogh']
print(metObjectsVanGogh['City'])
# print(metObjectsFull.loc[(pd.notnull(metObjectsFull['Artist Display Name'])) & (metObjectsFull['Artist Display Name'].str.contains('Gogh'))].count())
metObjectsVanGoghYears = metObjectsVanGogh[['Object ID','Object Begin Date']]

'''
exhibitionVanGoghList = []
apiBaseURL = 'https://collectionapi.metmuseum.org/api/collection/v1/object/'
#
metObjectIDs = metObjectsVanGogh['Object ID'].unique()
print(metObjectIDs)

# print(metObjectIDs[0])

### ALL ###
# Object ID 458962 (o = 6296) has no connection for whatever reason #
for o in (range(0,len(metObjectIDs)-1)):
    on = metObjectIDs[o]
    if o != 6296:
        apiObjData = requests.get(apiBaseURL + str(on)).json()
        try:
            for a in range(0,len(apiObjData['informationBoxes'])):
                if apiObjData['informationBoxes'][a]['label'] == 'Exhibition History':
                    exhibitionVanGoghList.append({'object_number':on,'exhibitionHistory':apiObjData['informationBoxes'][a]['text']})
                    print("added " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectIDs)))
        except (TypeError,KeyError):
            exhibitionVanGoghList.append({'object_number':on,'exhibitionHistory':np.nan})
            print("no exhibition for " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectIDs)))

exhibitionVanGoghList = pd.DataFrame(exhibitionVanGoghList)

#
print("--- %s seconds ---" % (time.time() - start_time))

metObjectsProvenanceJSON = os.path.join(dir,'assets','FullProvenance','metObjectsProvenance.json')
metObjectsProvenance = pd.read_json(metObjectsProvenanceJSON)


metObjectsProvenanceVanGogh = metObjectsProvenance.loc[metObjectsProvenance['object_number'].isin(metObjectIDs)]
metObjectsImagesVanGogh = metObjectsImages.loc[metObjectsImages['object_number'].isin(metObjectIDs)]
def get_image(row):
    return row['image_url'].split('/')[-1]
metObjectsImagesVanGogh['image'] = metObjectsImagesVanGogh.apply(get_image, axis=1)

metObjectsVanGoghExport = pd.merge(metObjectsProvenanceVanGogh,exhibitionVanGoghList,on='object_number',how='left').reset_index()
metObjectsVanGoghExport = pd.merge(metObjectsVanGoghExport,metObjectsImagesVanGogh,on='object_number',how='left').reset_index()
print(metObjectsVanGoghExport)

vanGoghListExportFilePath = os.path.join(dir,'assets','metObjectsVanGogh.json')
metObjectsVanGoghExport.to_json(vanGoghListExportFilePath)


# ~~ --- 535.2492849826813 seconds --- ~~


# provenanceList1FilePath = os.path.join(dir,'assets','metObjectsProvenance1.json')
# provenanceList2FilePath = os.path.join(dir,'assets','metObjectsProvenance2.json')
# provenanceList3FilePath = os.path.join(dir,'assets','metObjectsProvenance3.json')
# provenanceList4FilePath = os.path.join(dir,'assets','metObjectsProvenance4.json')
# provenanceList5FilePath = os.path.join(dir,'assets','metObjectsProvenance5.json')
# provenanceList6FilePath = os.path.join(dir,'assets','metObjectsProvenance6.json')
# provenanceList7FilePath = os.path.join(dir,'assets','metObjectsProvenance7.json')
#
# pL1 = pd.read_json(provenanceList1FilePath)
# pL2 = pd.read_json(provenanceList2FilePath)
# pL3 = pd.read_json(provenanceList3FilePath)
# pL4 = pd.read_json(provenanceList4FilePath)
# pL5 = pd.read_json(provenanceList5FilePath)
# pL6 = pd.read_json(provenanceList6FilePath)
# pL7 = pd.read_json(provenanceList7FilePath)
# provenanceList = pd.concat([pL1,pL2,pL3,pL4,pL5,pL6,pL7]).reset_index()
# provenanceList = provenanceList[['object_number','provenance']]
# # print(provenanceList.head(50))
# provenanceListExportFilePath = os.path.join(dir,assets','FullProvenance','metObjectsProvenance.json')
# provenanceList.to_json(provenanceListExportFilePath)
'''

# metObjectsVanGoghExportedJSON = os.path.join(dir,'assets','metObjectsVanGogh.json')
# metObjectsVanGoghExported = pd.read_json(metObjectsVanGoghExportedJSON)
# metObjectsVanGoghExported = metObjectsVanGoghExported[['object_number','provenance','exhibitionHistory','image_url','image']]
# metObjectsVanGoghExported = pd.merge(metObjectsVanGoghExported,metObjectsVanGoghYears,how='left',left_on='object_number',right_on='Object ID')
# metObjectsVanGoghExported = metObjectsVanGoghExported[['object_number','provenance','exhibitionHistory','image_url','image','Object Begin Date']]
# metObjectsVanGoghExported.columns = ['object_number','provenance','exhibitionHistory','image_url','image','object_year']
#
# vanGoghListExportFilePath = os.path.join(dir,'assets','metObjectsVanGogh.json')
# metObjectsVanGoghExported.to_json(vanGoghListExportFilePath)

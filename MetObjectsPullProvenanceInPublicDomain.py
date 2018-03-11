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
metObjectsUrl = 'https://media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv'
metObjectsCSV =         os.path.join(dir, 'assets','metObjects.csv')
# # metObjectsStatic5000 =  os.path.join(dir, 'assets','MetObjects5000.csv')
# metObjectsImages = os.path.join(dir, 'assets','MMAImageURLS.csv')
#
# metObjectsContent = requests.get(metObjectsUrl).content
# metObjectsFull = pd.read_csv(io.StringIO(metObjectsContent.decode('utf-8')))
metObjectsFull = pd.read_csv(metObjectsCSV)
metObjectsFull = metObjectsFull.loc[metObjectsFull['Is Public Domain'],:]
metObjectsFull = metObjectsFull.loc[metObjectsFull['Classification']=='Paintings',:]
metObjectsFull = metObjectsFull.sort_values('Object ID',ascending=True)
# # print(metObjectsFull['Classification'].value_counts())
#
provenanceList = []
apiBaseURL = 'https://collectionapi.metmuseum.org/api/collection/v1/object/'
#
metObjectIDs = metObjectsFull['Object ID'].unique()

# print(metObjectIDs[0])

### ALL ###
# Object ID 458962 (o = 6296) has no connection for whatever reason #
# for o in (range(0,len(metObjectIDs)-1)):
for o in (range(1000,1010)):
    on = metObjectIDs[o]
    if o != 6296:
        apiObjData = requests.get(apiBaseURL + str(on)).json()
        try:
            for a in range(0,len(apiObjData['informationBoxes'])):
                if apiObjData['informationBoxes'][a]['label'] == 'Provenance':
                    provenanceList.append({'object_number':on,'provenance':apiObjData['informationBoxes'][a]['text']})
                    print("added " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectIDs)))
        except (TypeError,KeyError):
            provenanceList.append({'object_number':on,'provenance':np.nan})
            print("no provenance for " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectIDs)))

provenanceList = pd.DataFrame(provenanceList)
# provenanceListExportFilePath = os.path.join(dir,'qual','assets','metObjectsProvenance.json')
# provenanceList.to_json(provenanceListExportFilePath)

print(provenanceList)
print("--- %s seconds ---" % (time.time() - start_time))


# ~~ --- 535.2492849826813 seconds --- ~~

### FIRST 1,000 ###
# for o in (range(0,1000)):
#     on = metObjectIDs[o]
#     apiObjData = requests.get(apiBaseURL + str(on)).json()
#     try:
#         for a in range(0,len(apiObjData['informationBoxes'])):
#             if apiObjData['informationBoxes'][a]['label'] == 'Provenance':
#                 provenanceList.append({'object_number':on,'provenance':apiObjData['informationBoxes'][a]['text']})
#                 print("added " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#     except (TypeError,KeyError):
#         provenanceList.append({'object_number':on,'provenance':np.nan})
#         print("no provenance for " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#     counter = counter + o
#
# provenanceList = pd.DataFrame(provenanceList)
# provenanceListExportFilePath = os.path.join(dir,'qual','assets','metObjectsProvenance1.json')
# provenanceList.to_json(provenanceListExportFilePath)
#
# print("--- %s seconds ---" % (time.time() - start_time))

### SECOND 1,000 ###
# for o in (range(1000,2000)):
#     on = metObjectIDs[o]
#     apiObjData = requests.get(apiBaseURL + str(on)).json()
#     try:
#         for a in range(0,len(apiObjData['informationBoxes'])):
#             if apiObjData['informationBoxes'][a]['label'] == 'Provenance':
#                 provenanceList.append({'object_number':on,'provenance':apiObjData['informationBoxes'][a]['text']})
#                 print("added " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#     except (TypeError,KeyError):
#         provenanceList.append({'object_number':on,'provenance':np.nan})
#         print("no provenance for " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#
# provenanceList = pd.DataFrame(provenanceList)
# provenanceListExportFilePath = os.path.join(dir,'qual','assets','metObjectsProvenance2.json')
# provenanceList.to_json(provenanceListExportFilePath)
#
# print("--- %s seconds ---" % (time.time() - start_time))

### THIRD 1,000 ###
# for o in (range(2000,3000)):
#     on = metObjectIDs[o]
#     apiObjData = requests.get(apiBaseURL + str(on)).json()
#     try:
#         for a in range(0,len(apiObjData['informationBoxes'])):
#             if apiObjData['informationBoxes'][a]['label'] == 'Provenance':
#                 provenanceList.append({'object_number':on,'provenance':apiObjData['informationBoxes'][a]['text']})
#                 print("added " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#     except (TypeError,KeyError):
#         provenanceList.append({'object_number':on,'provenance':np.nan})
#         print("no provenance for " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#     counter = counter + o
#
# provenanceList = pd.DataFrame(provenanceList)
# provenanceListExportFilePath = os.path.join(dir,'qual','assets','metObjectsProvenance3.json')
# provenanceList.to_json(provenanceListExportFilePath)
#
# print("--- %s seconds ---" % (time.time() - start_time))

### FOURTH 1,000 ###
# for o in (range(3000,4000)):
#     on = metObjectIDs[o]
#     apiObjData = requests.get(apiBaseURL + str(on)).json()
#     try:
#         for a in range(0,len(apiObjData['informationBoxes'])):
#             if apiObjData['informationBoxes'][a]['label'] == 'Provenance':
#                 provenanceList.append({'object_number':on,'provenance':apiObjData['informationBoxes'][a]['text']})
#                 print("added " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#     except (TypeError,KeyError):
#         provenanceList.append({'object_number':on,'provenance':np.nan})
#         print("no provenance for " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#
# provenanceList = pd.DataFrame(provenanceList)
# provenanceListExportFilePath = os.path.join(dir,'qual','assets','metObjectsProvenance4.json')
# provenanceList.to_json(provenanceListExportFilePath)
#
# print("--- %s seconds ---" % (time.time() - start_time))

### FIFTH 1,000 ###
# for o in (range(4000,5000)):
#     on = metObjectIDs[o]
#     apiObjData = requests.get(apiBaseURL + str(on)).json()
#     try:
#         for a in range(0,len(apiObjData['informationBoxes'])):
#             if apiObjData['informationBoxes'][a]['label'] == 'Provenance':
#                 provenanceList.append({'object_number':on,'provenance':apiObjData['informationBoxes'][a]['text']})
#                 print("added " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#     except (TypeError,KeyError):
#         provenanceList.append({'object_number':on,'provenance':np.nan})
#         print("no provenance for " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#
# provenanceList = pd.DataFrame(provenanceList)
# provenanceListExportFilePath = os.path.join(dir,'qual','assets','metObjectsProvenance5.json')
# provenanceList.to_json(provenanceListExportFilePath)
#
# print("--- %s seconds ---" % (time.time() - start_time))

### SIXTH 1,000 ###
# for o in (range(5000,6000)):
#     on = metObjectIDs[o]
#     apiObjData = requests.get(apiBaseURL + str(on)).json()
#     try:
#         for a in range(0,len(apiObjData['informationBoxes'])):
#             if apiObjData['informationBoxes'][a]['label'] == 'Provenance':
#                 provenanceList.append({'object_number':on,'provenance':apiObjData['informationBoxes'][a]['text']})
#                 print("added " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#     except (TypeError,KeyError):
#         provenanceList.append({'object_number':on,'provenance':np.nan})
#         print("no provenance for " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#
# provenanceList = pd.DataFrame(provenanceList)
# provenanceListExportFilePath = os.path.join(dir,'qual','assets','metObjectsProvenance6.json')
# provenanceList.to_json(provenanceListExportFilePath)
#
# print("--- %s seconds ---" % (time.time() - start_time))

### SEVENTH 1,000 ###
# Object ID 458962 (o = 6296) has no connection for whatever reason #
# for o in (range(6000,6849)):
#     on = metObjectIDs[o]
#     if o != 6296:
#         apiObjData = requests.get(apiBaseURL + str(on)).json()
#         try:
#             for a in range(0,len(apiObjData['informationBoxes'])):
#                 if apiObjData['informationBoxes'][a]['label'] == 'Provenance':
#                     provenanceList.append({'object_number':on,'provenance':apiObjData['informationBoxes'][a]['text']})
#                     print("added " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#         except (TypeError,KeyError):
#             provenanceList.append({'object_number':on,'provenance':np.nan})
#             print("no provenance for " + str(on) + ' - ' + str(o+1) + ' of ' + str(len(metObjectsFull['Object ID'].unique())))
#
# provenanceList = pd.DataFrame(provenanceList)
# provenanceListExportFilePath = os.path.join(dir,'qual','assets','metObjectsProvenance7.json')
# provenanceList.to_json(provenanceListExportFilePath)
#
# print("--- %s seconds ---" % (time.time() - start_time))

provenanceList1FilePath = os.path.join(dir,'qual','assets','metObjectsProvenance1.json')
provenanceList2FilePath = os.path.join(dir,'qual','assets','metObjectsProvenance2.json')
provenanceList3FilePath = os.path.join(dir,'qual','assets','metObjectsProvenance3.json')
provenanceList4FilePath = os.path.join(dir,'qual','assets','metObjectsProvenance4.json')
provenanceList5FilePath = os.path.join(dir,'qual','assets','metObjectsProvenance5.json')
provenanceList6FilePath = os.path.join(dir,'qual','assets','metObjectsProvenance6.json')
provenanceList7FilePath = os.path.join(dir,'qual','assets','metObjectsProvenance7.json')

pL1 = pd.read_json(provenanceList1FilePath)
pL2 = pd.read_json(provenanceList2FilePath)
pL3 = pd.read_json(provenanceList3FilePath)
pL4 = pd.read_json(provenanceList4FilePath)
pL5 = pd.read_json(provenanceList5FilePath)
pL6 = pd.read_json(provenanceList6FilePath)
pL7 = pd.read_json(provenanceList7FilePath)
provenanceList = pd.concat([pL1,pL2,pL3,pL4,pL5,pL6,pL7]).reset_index()
provenanceList = provenanceList[['object_number','provenance']]
# print(provenanceList.head(50))
provenanceListExportFilePath = os.path.join(dir,'qual','assets','metObjectsProvenance.json')
provenanceList.to_json(provenanceListExportFilePath)


# metObjectsImagesFull = pd.read_csv(metObjectsImages)
#
# metObjectsFull = metObjectsFull.loc[metObjectsFull['Is Public Domain'],:]
#
# ### Sample of how matching text to images would work for art describes art ###
# metObjectsWithImages = pd.merge(metObjectsFull,metObjectsImagesFull,on=['Object ID'],how='left')
# imageBaseURL = 'https://images.metmuseum.org/CRDImages/as/web-large/'
# imageSpecURL = str(metObjectsWithImages.loc[(metObjectsWithImages['Title'].notna()) & (metObjectsWithImages['Title'].str.lower().str.contains('contest')) & (metObjectsWithImages['Image File Name'].notna()),'Image File Name'].values[-1])
# imageTitle = str(metObjectsWithImages.loc[(metObjectsWithImages['Title'].notna()) & (metObjectsWithImages['Title'].str.lower().str.contains('contest')) & (metObjectsWithImages['Image File Name'].notna()),'Title'].values[-1])
# imageURL = imageBaseURL + imageSpecURL
# # print(imageURL)
# # print(imageTitle)
# # print(metObjectsWithImages.loc[(metObjectsWithImages['Classification']=='Paintings') & (metObjectsWithImages['Department_x']=='European Paintings'),:])
# print(metObjectsWithImages.loc[(metObjectsWithImages['Classification']=='Paintings'),'Department_x'].value_counts())
#
# ### Split up image into 100 pieces and print primary color for each, one row at a time ###
# import image_slicer
# # image_slicer.slice('/Users/ryanbest/Dropbox/GitHub/ms1-2018/qual/DP280846.jpg',100)
#
# import colorthief
# from colorthief import ColorThief
#
# for j in range(10):
#     # print(str(i+1).zfill(2))
#     # print(str(j+1).zfill(2))
#     color_thief = ColorThief('/Users/ryanbest/Dropbox/GitHub/ms1-2018/qual/DP280846_'+str(10).zfill(2)+'_'+str(j+1).zfill(2)+'.png')
#     # print(color_thief.get_color(quality=1))
# # color_thief = ColorThief('/Users/ryanbest/Dropbox/GitHub/ms1-2018/qual/DP280846_01_01.png')
# # print(color_thief.get_color(quality=1))

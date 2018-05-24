import pandas as pd
import numpy as np

import warnings
warnings.filterwarnings('ignore')

import os
dir = os.path.dirname(__file__)
import io

import requests
import googlemaps

import time
start_time = time.time()

import datetime
now = datetime.datetime.now()

from geotext import GeoText

import urllib.request as req

import re

import json


"""
# def get_image(row):
#     return row['image_url'].split('/')[-1]
# vanGoghProvenance['image'] = vanGoghProvenance.apply(get_image, axis=1)

# Save images into assets folder
# for x in vanGoghProvenance.index.values:
#     imageURL = vanGoghProvenance.iloc[x]['image_url']
#     image = vanGoghProvenance.iloc[x]['image']
#     imageFilePath = os.path.join(dir,'assets','images',image)
#     # print(imageFilePath)
#     req.urlretrieve(imageURL,imageFilePath)

# Create thumbnails of these images one by one using Image Magick on terminal
# http://www.imagemagick.org/Usage/thumbnails/#cut
# convert -define jpeg:size=500x500 DT1567.jpg -thumbnail 500x500^ -gravity center -extent 500x500 ../thumbnails/DT1567.jpg
"""

# metObjectsUrl = 'https://media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv'
# metObjectsContent = requests.get(metObjectsUrl).content
# metObjectsFull = pd.read_csv(io.StringIO(metObjectsContent.decode('utf-8')))

vanGoghProvenanceJSON = os.path.join(dir,'assets','metObjectsVanGogh.json')
vanGoghProvenance = pd.read_json(vanGoghProvenanceJSON)
# vanGoghProvenance = vanGoghProvenance[['image_url','object_number','provenance','exhibitionHistory','image']]
provenanceList = []
exhibitionHistoryList = []
for index in vanGoghProvenance.index.values:

    ### PROVENANCE ###
    objectNumber  = vanGoghProvenance['object_number'][index]
    prov          = vanGoghProvenance['provenance'][index]
    prov          = prov.replace('[MMA 1995.535]','') ## brackets delineate line break from one owner to another, so this causes an issue in https://metmuseum.org/art/collection/search/437998
    prov          = prov.replace('[','(')
    prov          = prov.replace(']',')')

    if objectNumber == 459123:
        splitProvList = prov.split(';')
    else:
        splitProvList = prov.split(');')


    for p in range(len(splitProvList)):
        pid = str(objectNumber) + '_' + str(p)
        provItem = splitProvList[p]
        provItem = provItem.strip() # remove leading and trailing spaces
        provItem = provItem.replace(' (',', ')
        provItem = provItem.replace('(','')
        provItem = provItem.replace(',000','000') # remove commas in things that may be dollar amounts, which will screw up my splitting later on
        if (objectNumber == 437980 and p == 5):
            provItem = provItem.replace('bought in Paris;','bought in Paris')
            provItemMain = provItem.split(';')[1]
        else :
            provItemMain = provItem.split(';')[0]
        provItemMainSplit = provItemMain.split(',')

        ## if there are three items in the first chunk of each provenance, it is usually organized as owner, location, year
        if len(provItemMainSplit) == 3 :

            ## Fringe Cases where the below doesn't work ##
            if (objectNumber == 436536 and p == 8):
                provOwner    = 'Wildenstein'
                provLocation = 'London'
                provYear     = '1943'
            elif (objectNumber == 459123 and p < 5) : #rows 2,3,and 4 for 459123 are wonky. I will need to make a guess for the year on one.
                if (p==2):
                    provOwner    = provItemMainSplit[0].strip()
                    provLocation = provItemMainSplit[1].strip().replace(')','')
                    provYear     = provItemMainSplit[2].strip()
                    provYear = re.sub('\D','', provYear) # remove everything that is not a number
                    provYear = provYear[:4]
                elif (p==3):
                    provOwner    = provItemMainSplit[0].strip()
                    provLocation = provItemMainSplit[2].strip()
                    provYear     = int(1910) #this is a guess splitting up the this owner and the next equally
                elif (p==4):
                    provOwner    = provItemMainSplit[0].strip() + ', ' + provItemMainSplit[1].strip().replace(')','')
                    provLocation = provItemMainSplit[2].strip()
                    provYear     = int(1935) #this is a guess based on when her husband died


            else :
                provOwner    = provItemMainSplit[0].strip()
                provLocation = provItemMainSplit[1].strip()
                provYear     = provItemMainSplit[2].strip()

                provLocation = provLocation.split(' and')[0]
                provLocation = provLocation.split('/')[0]

                provYear = re.sub('\D','', provYear) # remove everything that is not a number
                provYear = provYear[:4]

        ## more than three is a little weirder
        elif len(provItemMainSplit) > 3 :

            provItemMain = provItem.split(';')[0]
            ## Fringe Cases where the below doesn't work ##
            if ((objectNumber == 436528 and p == 1) or (objectNumber == 436534 and p == 1)) :
                provOwner     = "the estate of the artist's mother, Anna van gogh-Carbentus"
                provLocation  = 'Leiden'
                provYear     = '1908'
            elif (objectNumber == 459123 and p == 1):
                provOwner    = provItemMainSplit[1].strip()
                provLocation = provItemMainSplit[2].strip().split(')')[0]
                provYear     = int(provItemMainSplit[len(provItemMainSplit)-1].strip())

            else :
                ## let's guess that the last bit of string is the year ###
                ## that didn't work for 459123 - https://metmuseum.org/art/collection/search/459123
                if objectNumber==459123:
                    if p==0:
                        provYear = 1888
                    else:
                        provYear = provItemMainSplit[len(provItemMainSplit)-1].strip()
                        provYear = re.sub('\D','', provYear) # remove everything that is not a number
                        provYear = provYear[:4]
                else:
                    provYear = provItemMainSplit[len(provItemMainSplit)-1].strip()
                    provYear = re.sub('\D','', provYear) # remove everything that is not a number
                    provYear = provYear[:4]

                ### let's guess that the first bit of the string is the owner ###
                provOwner = provItemMainSplit[0].strip()

                ### now let's go through the remaining bits, see which one has cities text, and pull that text (along with country if possible)
                for a in range(1,len(provItemMainSplit)-1):
                    provItemMainSplit[a] = provItemMainSplit[a].replace('Asnières','Paris') #suburb of Paris not being picked up
                    provItemMainSplit[a] = provItemMainSplit[a].replace('Marie Julien','Arles') #this is for the first row of 459123 - data quality issue?

                    ## go through each row and if we pull a valid city (NOT anna from Van Gogh's mom), then atttribute that city as location
                    if ((len(GeoText(provItemMainSplit[a]).cities) > 0) and (provItemMainSplit[a].strip() != 'Anna van Gogh-Carbentus')):
                        try:
                            if len(GeoText(provItemMainSplit[a+1]).countries) > 0:
                                provLocation = provItemMainSplit[a].strip() + ' ' + provItemMainSplit[a+1].strip()
                            else:
                                provLocation = provItemMainSplit[a].strip()
                        except ValueError:
                            provLocation = provItemMainSplit[a].strip()
                        break
                    else :
                        provOwner += ', ' + provItemMainSplit[a].strip()

        ## less than three might not have all the info we need, so we'll look at context from other rows to see what's missing
        ### there are 13 instances of these across the 18 pieces for Van Gogh
        # y: ||||||||
        # o:
        # l: ||||                              (436535,436535)

        # so, none are missing the owner, most are missing year, and around half as many are missing location
        else :
            ## if we're missing year, then we will pull the last date from the previous year
            ### that means the next person will take ownership of the painting when the previous owner gave it up
            if re.sub('\D','', provItemMainSplit[1]) == '':
                if (objectNumber in ([436525,436526,436531])):
                    provYear = re.sub('\D','', splitProvList[p-1])[-4:]
                    provOwner = provItemMainSplit[0].strip()
                    provLocation = provItemMainSplit[1].split('and')[0].strip()
                else:
                    pass

            ## we know the year, but don't have the location in this data point
            else :
                provOwner = provItemMainSplit[0].strip()
                provYear = re.sub('\D','', provItemMainSplit[1])[:4]
                if (provOwner == 'Wildenstein') : # https://metmuseum.org/art/collection/search/436536
                    provLocation = 'London'
                elif (provOwner == 'A. Stoll') : # it's a guess = https://metmuseum.org/art/collection/search/436536
                    provLocation = 'London'
                elif (objectNumber==436533 and p==0) :
                    provLocation = 'Arles' # https://metmuseum.org/art/collection/search/436533
                elif (objectNumber==436535 and p==2) :
                    provLocation = 'Paris' # kind of a guess based on rows before and after
                elif (objectNumber==437998 and p==9) :
                    provLocation = 'Switzerland'
                else:
                    pass

        provenanceList.append({
             'pid': pid
            ,'object_number':int(objectNumber)
            ,'year': provYear
            ,'location': provLocation
            ,'owner': provOwner
        })

        ## add item if we know when it was transferred to MMA
        if (p==len(splitProvList)-1):
            if objectNumber not in ([459123]):
                mmaOwner    = 'Metropolitan Museum of Art'
                mmaLocation = 'Metropolitan Museum of Art'
                mmaProvItem = provItem.replace('; on loan to MMA, 1936','on loan to MMA')
                if re.sub('\D','', mmaProvItem.split(';')[-1]) == '':
                    mmaYearDec = re.sub('\D','', mmaProvItem.split(';')[-2])[-2:]
                else :
                    mmaYearDec = re.sub('\D','', mmaProvItem.split(';')[-1])[-2:]
                if int(mmaYearDec) < 20:
                    mmaYearCen = 20
                else :
                    mmaYearCen = 19
                mmaYear = int(str(mmaYearCen) + str(mmaYearDec))
                provenanceList.append({
                     'pid':str(objectNumber)+'_999'
                    ,'object_number':int(objectNumber)
                    ,'year':mmaYear
                    ,'location':mmaLocation
                    ,'owner':mmaOwner
                })



    ### EXHIBITION HISTORY ###
    if vanGoghProvenance['exhibitionHistory'][index] is not None:
        vanGoghProvenance['exhibitionHistory'][index] = vanGoghProvenance['exhibitionHistory'][index].replace('<br/><br/>THIS WORK MAY NOT BE LENT, BY TERMS OF ITS ACQUISITION BY THE METROPOLITAN MUSEUM OF ART. <br/><br/>','')
        vanGoghProvenance['exhibitionHistory'][index] = vanGoghProvenance['exhibitionHistory'][index].replace('St.','St')
        objectNumber = vanGoghProvenance['object_number'][index]
        exhibitionHistory = vanGoghProvenance['exhibitionHistory'][index]
        exhibitionHistory = vanGoghProvenance['exhibitionHistory'][index].split('<br/><br/>')
        if '' in exhibitionHistory: exhibitionHistory.remove('') # remove blank rows that come at the end

        def pullYear(n):
            exhibitionYear = int(exhibitionHistory[eh].split(',')[-n][-4:])
            # see if this event spans multiple years
            if ('-' in exhibitionHistory[eh]) :
                # if (objectNumber == 436525 and exhibitionYear == 1991) :
                #     print(n)
                #     print(exhibitionHistory[eh].split(".")[0])
                #     print(exhibitionHistory[eh])
                if len(exhibitionHistory[eh].split(',')) >= (n+1) :
                    if (len(exhibitionHistory[eh].split(',')[-(n+1)].split('-')) > 1) :
                        try:
                            exhibitionYear2 = int(exhibitionHistory[eh].split(',')[-(n+1)].split('-')[-2])
                            if exhibitionYear2 == exhibitionYear-1:
                                exhibitionHistoryList.append({
                                    'ehid': ehid,
                                    'object_number':int(objectNumber),
                                    'year': exhibitionYear2,
                                    'location': exhibitionLocation,
                                    'exhibition': exhibitionHistory[eh]
                                })
                                exhibitionHistoryList.append({
                                    'ehid': ehid,
                                    'object_number':int(objectNumber),
                                    'year': exhibitionYear,
                                    'location': exhibitionLocation,
                                    'exhibition': exhibitionHistory[eh]
                                })
                            else:
                                exhibitionHistoryList.append({
                                    'ehid': ehid,
                                    'object_number':int(objectNumber),
                                    'year': exhibitionYear,
                                    'location': exhibitionLocation,
                                    'exhibition': exhibitionHistory[eh]
                                })
                        except ValueError:
                            exhibitionHistoryList.append({
                                'ehid': ehid,
                                'object_number':int(objectNumber),
                                'year': exhibitionYear,
                                'location': exhibitionLocation,
                                'exhibition': exhibitionHistory[eh]
                            })
                else :
                    exhibitionHistoryList.append({
                        'ehid': ehid,
                        'object_number': int(objectNumber),
                        'year': exhibitionYear,
                        'location': exhibitionLocation,
                        'exhibition': exhibitionHistory[eh]
                    })
            else:
                exhibitionHistoryList.append({
                    'ehid': ehid,
                    'object_number': int(objectNumber),
                    'year': exhibitionYear,
                    'location': exhibitionLocation,
                    'exhibition': exhibitionHistory[eh]
                })

        # for each record in the exhibition history I need year, city, and name of exhibition/museum
        for eh in range(len(exhibitionHistory)):
            ehid = str(objectNumber) + '_' + str(eh)
            exhibitionHistory[eh] = exhibitionHistory[eh].replace('–','-')
            if exhibitionHistory[eh].split(".")[0] == "New York" and exhibitionHistory[eh].split(".")[1].strip() == "The Metropolitan Museum of Art":
                exhibitionLocation = "Metropolitan Museum of Art"
            else:
                exhibitionLocation = exhibitionHistory[eh].split(".")[0]
            if len(exhibitionHistory[eh].split(',')) >= 2:
                try:
                    pullYear(2)
                except ValueError:
                    try:
                        pullYear(3)
                    except ValueError:
                        try:
                            pullYear(4)
                        except ValueError:
                            pullYear(5)
            else:
                # one fringe case, which is 436525, reading Denver Art Museum.  1938 [see Los Angeles 1941].
                exhibitionYear = int(exhibitionHistory[eh].split(' [')[0][-4:])
                exhibitionHistoryList.append({
                    'ehid': ehid,
                    'object_number': int(objectNumber),
                    'year': exhibitionYear,
                    'location': exhibitionLocation,
                    'exhibition': exhibitionHistory[eh]
                })

exhibitionHistoryList = pd.DataFrame(exhibitionHistoryList)

provenanceList = pd.DataFrame(provenanceList)
provenanceList['year'] = provenanceList['year'].astype(int)
for index in vanGoghProvenance.index.values:
    objectNumber = vanGoghProvenance['object_number'][index]
    objectYear = vanGoghProvenance['object_year'][index]
    if len(provenanceList.loc[(provenanceList['object_number']==objectNumber) & (provenanceList['year']==objectYear),:]) == 0:
        firstDataPoint = pd.DataFrame({
            'pid' : str(objectNumber)+'_-1'
            ,'object_number' : int(objectNumber)
            ,'year' : int(objectYear)
            ,'location' : 'Paris'
            ,'owner' : 'the artist'
            # ,columns = [['pid'],['object_number'],['year'],['location'],['owner']]
        }, index=[0])
        provenanceList = provenanceList.append(firstDataPoint,ignore_index=True)

provenanceList = provenanceList.sort_values(by=['object_number','year'])


## Little bit of manual location clean-up
exhibitionHistoryList.loc[exhibitionHistoryList['location']=='Washington','location'] = 'Washington D.C.'
exhibitionHistoryList.loc[exhibitionHistoryList['location']=='Zurich','location'] = 'Zürich'
exhibitionHistoryList.loc[exhibitionHistoryList['location']=='Oxford Arts Club','location'] = 'Oxford'
provenanceList.loc[provenanceList['location']=='Zurich','location'] = 'Zürich'


### Pull Lat Lng coordinates for all locations from Google Geocoding API once, which I will then join back into Prov and ExhibHistory data
'''
locationsList = list(provenanceList['location'].unique()) + list(exhibitionHistoryList['location'].unique())
locationsList = list(set(locationsList))
# print(locationsList)
locationsGeo = []
for l in range(len(locationsList)):
    time.sleep(0.5) # Do two requests per second to avoid issues with Google API Usage Limits - https://developers.google.com/maps/documentation/geocoding/usage-limits
    print(locationsList[l])

    # # seach google geocoding api to pull LatLng for that location
    coordinates = []
    googleAPIKey = 'AIzaSyClejN5Zy--nDKo4SbWM2S2eWyufkMnyEs'
    googleGeocodeBaseURL = 'https://maps.googleapis.com/maps/api/geocode/json?address='
    exhibitionLocationURL = locationsList[l].replace(' ','+')
    responseURL = googleGeocodeBaseURL+exhibitionLocationURL+'&key='+googleAPIKey
    response = requests.get(responseURL)
    resp_json_payload = response.json()
    lat = resp_json_payload['results'][0]['geometry']['location']['lat']
    lng = resp_json_payload['results'][0]['geometry']['location']['lng']
    coordinates.append(lat)
    coordinates.append(lng)
    print("--- %s seconds ---" % (time.time() - start_time))
    #
    # # add exhibition to exhibitionHistoryList
    #
    locationsGeo.append({
        'location': locationsList[l],
        'coordinates': coordinates
    })

locationsGeoDF = pd.DataFrame(locationsGeo)
locationsGeoJSON = os.path.join(dir,'assets','locationsGeo.json')
locationsGeoDF.to_json(locationsGeoJSON)
'''

### Join pulled lat lng coordinates into Prov and ExhibHistory
locationsGeoJSON = os.path.join(dir,'assets','locationsGeo.json')
locationsGeo = pd.read_json(locationsGeoJSON)
exhibitionHistoryList = pd.merge(exhibitionHistoryList,locationsGeo,on='location',how='left')
provenanceList = pd.merge(provenanceList,locationsGeo,on='location',how='left')
exhibitionHistoryList.columns = ['pid','owner','location','object_number','year','coordinates']
provenanceList['data_type'] = 'provenance'
exhibitionHistoryList['data_type'] = 'exhibition'

currentYear = now.year

# print(provenanceList.columns.values)
# print(exhibitionHistoryList.columns.values)
# print(exhibitionHistoryList.head(15))

provAndExhib = pd.concat([provenanceList,exhibitionHistoryList])
provAndExhib = provAndExhib.sort_values(by=['object_number','year'],ascending=['True','True']).reset_index()
# print(provAndExhib.head(15))

for index in vanGoghProvenance.index.values:
    eventSpecificRows = []
    imageName = vanGoghProvenance['image'][index]
    # print(imageName)
    objectNumber = vanGoghProvenance['object_number'][index]
    ownerList = provenanceList.loc[provenanceList['object_number']==objectNumber,'owner'].unique()
    # if objectNumber == 436525:
    for o in range(len(ownerList)):
        owner = ownerList[o]
        ownerRow = provenanceList.loc[(provenanceList['owner']==owner) & (provenanceList['object_number']==objectNumber),:]
        ownerRowIndex = ownerRow.index.values[0]
        if owner == ownerList[0]:
            prevOwner = 'FIRST'
        else:
            prevOwner = ownerList[o-1]
        if owner == ownerList[len(ownerList)-1]:
            nextOwner = 'LAST'
        else:
            nextOwner = ownerList[o+1]

        def addOwnerRows(objectNumber,owner,prevOwner,nextOwner):
            ownerRow = provenanceList.loc[(provenanceList['owner']==owner) & (provenanceList['object_number']==objectNumber),:]
            ownerRowIndex = ownerRow.index.values[0]

            # prevOwnerRow = provenanceList.loc[(provenanceList['owner']==prevOwner) & (provenanceList['object_number']==objectNumber),:]
            # prevOwnerRowIndex = prevOwnerRow.index.values[0]

            # nextOwnerRow = provenanceList.loc[(provenanceList['owner']==nextOwner) & (provenanceList['object_number']==objectNumber),:]
            # nextOwnerRowIndex = nextOwnerRow.index.values[0]

            startYear = provenanceList['year'][ownerRowIndex]
            if nextOwner == 'LAST':
                endYear = currentYear
                nextOwnerRowIndex = ownerRowIndex
            else:
                nextOwnerRow = provenanceList.loc[(provenanceList['owner']==nextOwner) & (provenanceList['object_number']==objectNumber),:]
                nextOwnerRowIndex = nextOwnerRow.index.values[0]
                endYear = provenanceList['year'][nextOwnerRowIndex]

            ownerExhibitions = exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==objectNumber) & (exhibitionHistoryList['year'] >= startYear) & (exhibitionHistoryList['year'] < endYear),:]

            ## Add first line that moves "to and from" starting location ##
            if prevOwner == 'FIRST':
                year = int(provenanceList['year'][ownerRowIndex])

                coordinates = []
                coordinates.append(provenanceList['coordinates'][ownerRowIndex])
                coordinates.append(provenanceList['coordinates'][ownerRowIndex])

                cities = []
                cities.append(provenanceList['location'][ownerRowIndex])
                cities.append(provenanceList['location'][ownerRowIndex])

                owners = []
                owners.append(provenanceList['owner'][ownerRowIndex])
                owners.append(provenanceList['owner'][ownerRowIndex])

                changeFlag = 1

                dataType = 'provenance'

                eventSpecificRows.append({
                    'line': {
                         'year': year
                        ,'coordinates': coordinates
                        ,'cities': cities
                        ,'owner': owners
                        ,'changeFlag': changeFlag
                        ,'dataType': dataType
                    }
                })

                if len(ownerExhibitions)>0:
                    ownerExhibitionIndeces = ownerExhibitions.index.values
                    # print(len(ownerExhibitionIndeces))
                    year = int(exhibitionHistoryList['year'][ownerExhibitionIndeces[0]])

                    coordinates = []
                    coordinates.append(provenanceList['coordinates'][ownerRowIndex])
                    coordinates.append(exhibitionHistoryList['coordinates'][ownerExhibitionIndeces[0]])

                    cities = []
                    cities.append(provenanceList['location'][ownerRowIndex])
                    cities.append(exhibitionHistoryList['location'][ownerExhibitionIndeces[0]])

                    owners = []
                    owners.append(provenanceList['owner'][ownerRowIndex])
                    owners.append("Exhibition - "+re.sub(" ([\(\[]).*?([\)\]])", "", exhibitionHistoryList['owner'][ownerExhibitionIndeces[0]].split('.')[1].replace('"','')).split(",")[0])
                    # owners.append(exhibitionHistoryList['owner'][ownerExhibitionIndeces[0]])
                    # owners.append("On Exhibition")

                    changeFlag = 1

                    dataType = 'exhibition'

                    eventSpecificRows.append({
                        'line': {
                             'year': year
                            ,'coordinates': coordinates
                            ,'cities': cities
                            ,'owner': owners
                            ,'changeFlag': changeFlag
                            ,'dataType': dataType
                        }
                    })

                    for oe in range(1,len(ownerExhibitionIndeces)):
                        year = int(exhibitionHistoryList['year'][ownerExhibitionIndeces[oe]])

                        coordinates = []
                        coordinates.append(exhibitionHistoryList['coordinates'][ownerExhibitionIndeces[oe-1]])
                        coordinates.append(exhibitionHistoryList['coordinates'][ownerExhibitionIndeces[oe]])

                        cities = []
                        cities.append(exhibitionHistoryList['location'][ownerExhibitionIndeces[oe-1]])
                        cities.append(exhibitionHistoryList['location'][ownerExhibitionIndeces[oe]])

                        owners = []
                        # owners.append(exhibitionHistoryList['owner'][ownerExhibitionIndeces[oe-1]])
                        owners.append("On Exhibition")
                        # print(exhibitionHistoryList['owner'][ownerExhibitionIndeces[0]].split('.')[1].replace('"',''))
                        # owners.append(exhibitionHistoryList['owner'][ownerExhibitionIndeces[oe]])
                        owners.append("On Exhibition")

                        changeFlag = 1

                        dataType = 'exhibition'

                        eventSpecificRows.append({
                            'line': {
                                 'year': year
                                ,'coordinates': coordinates
                                ,'cities': cities
                                ,'owner': owners
                                ,'changeFlag': changeFlag
                                ,'dataType': dataType
                            }
                        })

                    year = int(provenanceList['year'][nextOwnerRowIndex])

                    coordinates = []
                    coordinates.append(exhibitionHistoryList['coordinates'][ownerExhibitionIndeces[len(ownerExhibitionIndeces)-1]])
                    coordinates.append(provenanceList['coordinates'][nextOwnerRowIndex])

                    cities = []
                    cities.append(exhibitionHistoryList['location'][ownerExhibitionIndeces[len(ownerExhibitionIndeces)-1]])
                    cities.append(provenanceList['location'][nextOwnerRowIndex])

                    owners = []
                    # owners.append(exhibitionHistoryList['owner'][ownerExhibitionIndeces[len(ownerExhibitionIndeces)-1]])
                    # owners.append("On Exhibition")
                    owners.append("Exhibition - "+re.sub(" ([\(\[]).*?([\)\]])", "", exhibitionHistoryList['owner'][ownerExhibitionIndeces[len(ownerExhibitionIndeces)-1]].split('.')[1].replace('"','')).split(",")[0])
                    # print(re.sub(" ([\(\[]).*?([\)\]])", "", exhibitionHistoryList['owner'][ownerExhibitionIndeces[0]].split('.')[1].replace('"','')).split(",")[0])
                    owners.append(provenanceList['owner'][nextOwnerRowIndex])

                    changeFlag = 1

                    dataType = 'exhibition'

                    eventSpecificRows.append({
                        'line': {
                             'year': year
                            ,'coordinates': coordinates
                            ,'cities': cities
                            ,'owner': owners
                            ,'changeFlag': changeFlag
                            ,'dataType': dataType
                        }
                    })

                else:
                    # pass
                    year = int(provenanceList['year'][nextOwnerRowIndex])

                    coordinates = []
                    coordinates.append(provenanceList['coordinates'][ownerRowIndex])
                    coordinates.append(provenanceList['coordinates'][nextOwnerRowIndex])

                    cities = []
                    cities.append(provenanceList['location'][ownerRowIndex])
                    cities.append(provenanceList['location'][nextOwnerRowIndex])

                    owners = []
                    owners.append(provenanceList['owner'][ownerRowIndex])
                    owners.append(provenanceList['owner'][nextOwnerRowIndex])

                    changeFlag = 1

                    dataType = 'provenance'

                    eventSpecificRows.append({
                        'line': {
                             'year': year
                            ,'coordinates': coordinates
                            ,'cities': cities
                            ,'owner': owners
                            ,'changeFlag': changeFlag
                            ,'dataType': dataType
                        }
                    })



            else:
                prevOwnerRow = provenanceList.loc[(provenanceList['owner']==prevOwner) & (provenanceList['object_number']==objectNumber),:]
                prevOwnerRowIndex = prevOwnerRow.index.values[0]

                # year = int(provenanceList['year'][ownerRowIndex])
                #
                # coordinates = []
                # coordinates.append(provenanceList['coordinates'][prevOwnerRowIndex])
                # coordinates.append(provenanceList['coordinates'][ownerRowIndex])
                #
                # cities = []
                # cities.append(provenanceList['location'][prevOwnerRowIndex])
                # cities.append(provenanceList['location'][ownerRowIndex])
                #
                # owners = []
                # owners.append(provenanceList['owner'][prevOwnerRowIndex])
                # owners.append(provenanceList['owner'][ownerRowIndex])
                #
                # changeFlag = 1
                #
                # dataType = 'provenance'
                #
                # eventSpecificRows.append({
                #     'line': {
                #          'year': year
                #         ,'coordinates': coordinates
                #         ,'cities': cities
                #         ,'owner': owners
                #         ,'changeFlag': changeFlag
                #         ,'dataType': dataType
                #     }
                # })


                ### Were there any exhibitions that happened while that person was the owner? ###
                if len(ownerExhibitions)>0:
                    ownerExhibitionIndeces = ownerExhibitions.index.values
                    # print(len(ownerExhibitionIndeces))
                    year = int(ownerExhibitions['year'][ownerExhibitionIndeces[0]])

                    coordinates = []
                    coordinates.append(provenanceList['coordinates'][ownerRowIndex])
                    coordinates.append(ownerExhibitions['coordinates'][ownerExhibitionIndeces[0]])

                    cities = []
                    cities.append(provenanceList['location'][ownerRowIndex])
                    cities.append(ownerExhibitions['location'][ownerExhibitionIndeces[0]])

                    owners = []
                    owners.append(provenanceList['owner'][ownerRowIndex])
                    # owners.append(ownerExhibitions['owner'][ownerExhibitionIndeces[0]])
                    # owners.append("On Exhibition")
                    owners.append("Exhibition - "+re.sub(" ([\(\[]).*?([\)\]])", "", exhibitionHistoryList['owner'][ownerExhibitionIndeces[0]].split('.')[1].replace('"','')).split(",")[0])
                    # print(exhibitionHistoryList['owner'][ownerExhibitionIndeces[0]].split('.')[0].replace('"',''))

                    changeFlag = 1

                    dataType = 'exhibition'

                    eventSpecificRows.append({
                        'line': {
                             'year': year
                            ,'coordinates': coordinates
                            ,'cities': cities
                            ,'owner': owners
                            ,'changeFlag': changeFlag
                            ,'dataType': dataType
                        }
                    })

                    for oe in range(1,len(ownerExhibitionIndeces)):
                        year = int(ownerExhibitions['year'][ownerExhibitionIndeces[oe]])

                        coordinates = []
                        coordinates.append(ownerExhibitions['coordinates'][ownerExhibitionIndeces[oe-1]])
                        coordinates.append(ownerExhibitions['coordinates'][ownerExhibitionIndeces[oe]])

                        cities = []
                        cities.append(ownerExhibitions['location'][ownerExhibitionIndeces[oe-1]])
                        cities.append(ownerExhibitions['location'][ownerExhibitionIndeces[oe]])

                        owners = []
                        # owners.append(ownerExhibitions['owner'][ownerExhibitionIndeces[oe-1]])
                        owners.append("Exhibition - "+re.sub(" ([\(\[]).*?([\)\]])", "", exhibitionHistoryList['owner'][ownerExhibitionIndeces[oe-1]].replace("Mrs.","Mrs").replace("G.","G").replace("R.","R").replace("M.","M").replace("E.","E").split('.')[1].replace('"','')).split(",")[0])
                        owners.append("Exhibition - "+re.sub(" ([\(\[]).*?([\)\]])", "", exhibitionHistoryList['owner'][ownerExhibitionIndeces[oe]].replace("Mrs.","Mrs").replace("G.","G").replace("R.","R").replace("M.","M").replace("E.","E").split('.')[1].replace('"','')).split(",")[0])
                        # owners.append("On Exhibition")
                        # owners.append("On Exhibition")
                        # print(exhibitionHistoryList['owner'][ownerExhibitionIndeces[0]].split('.')[1].replace('"',''))

                        changeFlag = 1

                        dataType = 'exhibition'

                        eventSpecificRows.append({
                            'line': {
                                 'year': year
                                ,'coordinates': coordinates
                                ,'cities': cities
                                ,'owner': owners
                                ,'changeFlag': changeFlag
                                ,'dataType': dataType
                            }
                        })

                    if nextOwner == 'LAST':
                        year = int(ownerExhibitions['year'][ownerExhibitionIndeces[len(ownerExhibitionIndeces)-1]])
                    else:
                        year = int(provenanceList['year'][nextOwnerRowIndex])

                    coordinates = []
                    coordinates.append(ownerExhibitions['coordinates'][ownerExhibitionIndeces[len(ownerExhibitionIndeces)-1]])
                    coordinates.append(provenanceList['coordinates'][nextOwnerRowIndex])

                    cities = []
                    cities.append(ownerExhibitions['location'][ownerExhibitionIndeces[len(ownerExhibitionIndeces)-1]])
                    cities.append(provenanceList['location'][nextOwnerRowIndex])

                    owners = []
                    # owners.append(ownerExhibitions['owner'][ownerExhibitionIndeces[len(ownerExhibitionIndeces)-1]])
                    # owners.append("On Exhibition")
                    owners.append("Exhibition - "+re.sub(" ([\(\[]).*?([\)\]])", "", exhibitionHistoryList['owner'][ownerExhibitionIndeces[len(ownerExhibitionIndeces)-1]].replace("Mrs.","Mrs").replace("G.","G").replace("R.","R").replace("M.","M").replace("E.","E").replace("J.","J").replace("Alex.","Alex").split('.')[1].replace('"','')).split(",")[0])
                    owners.append(provenanceList['owner'][nextOwnerRowIndex])

                    changeFlag = 1

                    dataType = 'provenance'

                    eventSpecificRows.append({
                        'line': {
                             'year': year
                            ,'coordinates': coordinates
                            ,'cities': cities
                            ,'owner': owners
                            ,'changeFlag': changeFlag
                            ,'dataType': dataType
                        }
                    })

                else:
                    # pass
                    year = int(provenanceList['year'][nextOwnerRowIndex])

                    coordinates = []
                    coordinates.append(provenanceList['coordinates'][ownerRowIndex])
                    coordinates.append(provenanceList['coordinates'][nextOwnerRowIndex])

                    cities = []
                    cities.append(provenanceList['location'][ownerRowIndex])
                    cities.append(provenanceList['location'][nextOwnerRowIndex])

                    owners = []
                    owners.append(provenanceList['owner'][ownerRowIndex])
                    owners.append(provenanceList['owner'][nextOwnerRowIndex])

                    changeFlag = 1

                    dataType = 'provenance'

                    eventSpecificRows.append({
                        'line': {
                             'year': year
                            ,'coordinates': coordinates
                            ,'cities': cities
                            ,'owner': owners
                            ,'changeFlag': changeFlag
                            ,'dataType': dataType
                        }
                    })

            # print(str(startYear) + '-' + str(endYear))

        addOwnerRows(objectNumber,owner,prevOwner,nextOwner)


    # print(eventSpecificRows)

    '''
    jsonLINE = []

    def addProvenance(column,listName):
        for x in provenanceList.loc[(provenanceList['object_number']==vanGoghProvenance['object_number'][index]) & (provenanceList['year']==y),column].index.values:
            listName.append(provenanceList.loc[(provenanceList['object_number']==vanGoghProvenance['object_number'][index]) & (provenanceList['year']==y),column][x])

    def addPrevProvenance(column,listName):
        provIndex = provenanceList.loc[(provenanceList['object_number']==vanGoghProvenance['object_number'][index]) & (provenanceList['year']==y),column].index.values
        provIndex = provIndex[0]
        if provIndex == 0:
            newIndex = 0
        else:
            newIndex = provIndex-1
        if provenanceList['object_number'][newIndex] == provenanceList['object_number'][provIndex]:
            listName.append(provenanceList[column][newIndex])

    def addCurrentProvenance(column,listName):
        prevIndex = provenanceList.loc[(provenanceList['object_number']==vanGoghProvenance['object_number'][index]) & (provenanceList['year']<y),column].index.values[-1]
        listName.append(provenanceList[column][prevIndex])

    def addExhibition(column,listName):
        for x in exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y),column].index.values:
            listName.append(exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y),column][x])

    def addToJSONLine():
        jsonLINE.append({
            'line': {
                 'year': year
                ,'coordinates': coordinates
                ,'cities': cities
                ,'owner': owners
                ,'changeFlag': changeFlag
                ,'dataType': dataType
            }
        })

    # print(vanGoghProvenance)
    objectNumber = vanGoghProvenance['object_number'][index]
    for y in range(vanGoghProvenance['object_year'][index],currentYear):
        year = y

        ### This is where owners change hands ###
        if (len(provenanceList.loc[(provenanceList['object_number']==vanGoghProvenance['object_number'][index]) & (provenanceList['year']==y)]) >= 1):
            ## If there were exhibitions in that year ###
            if (len(exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y)]) > 0):
                ehidList = exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y),'ehid'].unique()
                ### If an exhibition spanned into the next year ##
                if len(exhibitionHistoryList.loc[(exhibitionHistoryList['ehid'].isin(ehidList)) & (exhibitionHistoryList['year']==y+1)]) > 0:
                    ## no examples of this, but adding just in case for the future ##
                    ### Add all ownership changing hands, then all exhibitions ###
                    coordinates = []
                    addPrevProvenance('coordinates',coordinates)
                    addProvenance('coordinates',coordinates)
                    addExhibition('coordinates',coordinates)

                    cities = []
                    addPrevProvenance('location',cities)
                    addProvenance('location',cities)
                    addExhibition('location',cities)

                    owners = []
                    addPrevProvenance('owner',owners)
                    addProvenance('owner',owners)
                    addExhibition('exhibition',owners)

                    changeFlag = []
                    changeFlag.append(1)

                    dataType = []
                    for cd in range(len(exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y)])):
                        dataType.append("exhibition")
                    dataType.append("provenance")
                    for cd in range(len(provenanceList.loc[(provenanceList['object_number']==vanGoghProvenance['object_number'][index]) & (provenanceList['year']==y)])):
                        dataType.append("provenance")

                    print(len(coordinates))
                    # addToJSONLine()


                ### If an exhibition spanned into the past year ##
                elif len(exhibitionHistoryList.loc[(exhibitionHistoryList['ehid'].isin(ehidList)) & (exhibitionHistoryList['year']==y-1)]) > 0:
                    ### Add all exhibitions, then new ownership changing hands ###
                    coordinates = []
                    addExhibition('coordinates',coordinates)
                    addProvenance('coordinates',coordinates)

                    cities = []
                    addExhibition('location',cities)
                    addProvenance('location',cities)

                    owners = []
                    addExhibition('exhibition',owners)
                    addProvenance('owner',owners)

                    changeFlag = []
                    changeFlag.append(1)

                    dataType = []
                    for cd in range(len(exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y)])):
                        dataType.append("exhibition")
                    for cd in range(len(provenanceList.loc[(provenanceList['object_number']==vanGoghProvenance['object_number'][index]) & (provenanceList['year']==y)])):
                        dataType.append("provenance")

                    addToJSONLine()

                ### Ehibition was only in this year ###
                else:
                    ### Add first owner then all exhibitions, then new ownership ###
                    coordinates = []
                    addPrevProvenance('coordinates',coordinates)
                    addExhibition('coordinates',coordinates)
                    addProvenance('coordinates',coordinates)

                    cities = []
                    addPrevProvenance('location',cities)
                    addExhibition('location',cities)
                    addProvenance('location',cities)

                    owners = []
                    addPrevProvenance('owner',owners)
                    addExhibition('exhibition',owners)
                    addProvenance('owner',owners)

                    changeFlag = []
                    changeFlag.append(1)

                    dataType = []
                    dataType.append("provenance")
                    for cd in range(len(exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y)])):
                        dataType.append("exhibition")
                    for cd in range(len(provenanceList.loc[(provenanceList['object_number']==vanGoghProvenance['object_number'][index]) & (provenanceList['year']==y)])):
                        dataType.append("provenance")

                    addToJSONLine()


            else :
                ### This is where owners change hands once without exhibitions int that year. ###
                coordinates = []
                addPrevProvenance('coordinates',coordinates)
                addProvenance('coordinates',coordinates)

                cities = []
                addPrevProvenance('location',cities)
                addProvenance('location',cities)

                owners = []
                addPrevProvenance('owner',owners)
                addProvenance('owner',owners)

                changeFlag = []
                changeFlag.append(1)

                dataType = []
                dataType.append("provenance")
                for cd in range(len(provenanceList.loc[(provenanceList['object_number']==vanGoghProvenance['object_number'][index]) & (provenanceList['year']==y)])):
                    dataType.append("provenance")

                addToJSONLine()

        ### This is where no ownership changes hands ###
        else:
            ### Is there an exhibition in this year? ###
            if (len(exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y)]) > 0):
                ehidList = exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y),'ehid'].unique()
                ### If an exhibition spanned into the next year ##
                if len(exhibitionHistoryList.loc[(exhibitionHistoryList['ehid'].isin(ehidList)) & (exhibitionHistoryList['year']==y+1)]) > 0:
                    ## Goes from current owner to exhibitions
                    coordinates = []
                    addCurrentProvenance('coordinates',coordinates)
                    addExhibition('coordinates',coordinates)

                    cities = []
                    addCurrentProvenance('location',cities)
                    addExhibition('location',cities)

                    owners = []
                    addCurrentProvenance('owner',owners)
                    addExhibition('exhibition',owners)

                    changeFlag = []
                    changeFlag.append(1)

                    dataType = []
                    dataType.append("provenance")
                    for cd in range(len(exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y)])):
                        dataType.append("exhibition")

                    addToJSONLine()

                ### If an exhibition spanned into the past year ##
                elif len(exhibitionHistoryList.loc[(exhibitionHistoryList['ehid'].isin(ehidList)) & (exhibitionHistoryList['year']==y-1)]) > 0:
                    ## Goes from exhibitions back to current owner
                    coordinates = []
                    addExhibition('coordinates',coordinates)
                    addCurrentProvenance('coordinates',coordinates)

                    cities = []
                    addExhibition('location',cities)
                    addCurrentProvenance('location',cities)

                    owners = []
                    addExhibition('exhibition',owners)
                    addCurrentProvenance('owner',owners)

                    changeFlag = []
                    changeFlag.append(1)

                    dataType = []
                    for cd in range(len(exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y)])):
                        dataType.append("exhibition")
                    dataType.append("provenance")

                    addToJSONLine()

                ### Ehibition was only in this year ###
                else:
                    # if (objectNumber == 436525 and year == 1991):
                    #     print(exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y)])
                    ## Goes from current owner to exhibitions, back to current owner
                    coordinates = []
                    addCurrentProvenance('coordinates',coordinates)
                    addExhibition('coordinates',coordinates)
                    addCurrentProvenance('coordinates',coordinates)

                    cities = []
                    addCurrentProvenance('location',cities)
                    addExhibition('location',cities)
                    addCurrentProvenance('location',cities)

                    owners = []
                    addCurrentProvenance('owner',owners)
                    addExhibition('exhibition',owners)
                    addCurrentProvenance('owner',owners)

                    changeFlag = []
                    changeFlag.append(1)

                    dataType = []
                    dataType.append("provenance")
                    for cd in range(len(exhibitionHistoryList.loc[(exhibitionHistoryList['object_number']==vanGoghProvenance['object_number'][index]) & (exhibitionHistoryList['year']==y)])):
                        dataType.append("exhibition")
                    dataType.append("provenance")

                    addToJSONLine()

            else:
                pass
                ## current provenance ##
                # coordinates = []
                # addCurrentProvenance('coordinates',coordinates)
                #
                # cities = []
                # addCurrentProvenance('location',cities)
                #
                # owners = []
                # addCurrentProvenance('owner',owners)
                #
                # changeFlag = []
                # changeFlag.append(0)
                #
                # dataType = []
                # dataType.append("provenance")
                #
                # addToJSONLine()
                '''


    jsonLINEExport = {
        'objects': eventSpecificRows
    }


    # print(jsonLINEExport);


    ## Export a JSON for each painting ###
    jsonExportName = 'jsonLINE2' + vanGoghProvenance['image'][index].split('.')[0] + '.json'
    jsonExportPath = os.path.join(dir,'assets/'+jsonExportName)
    js = json.dumps(jsonLINEExport)
    fp = open(jsonExportName, 'a')
    fp.write(js)
    fp.close()
    print("added " + jsonExportName)
    print("--- %s seconds ---" % (time.time() - start_time))

import json
from selenium import webdriver
from time import sleep
import atexit
from pymongo import MongoClient
from config import mongoUri, dbName, APIKeys
from datetime import datetime
import requests

db = MongoClient(mongoUri)[dbName]
contacts = db['contacts']
queries = db['queries']

# profile = webdriver.FirefoxProfile()
# profile.set_preference("devtools.jsonview.enabled", False)
# driver = webdriver.Firefox(profile)


def exit_handler():
    print('Application is ending!')
    # driver.quit()


atexit.register(exit_handler)

# Load a file from /scripts/{filename}.js
def read_script(file):
    with open('./js/'+file+'.js') as f:
        return f.read()

# extracts the business name from the domain name
def getCompanyNameFromDomain(domain):
    domain = domain.lower()
    companyNameFromDomain = domain.split('.')[0];
    companyNameFromDomain = companyNameFromDomain.replace('-','')
    companyNameFromDomain = companyNameFromDomain.replace('_','')
    companyNameFromDomain = companyNameFromDomain.replace('&','')
    
    return companyNameFromDomain

def getCleanCompanyName(company):
    company = company.lower()
    
    company = company.replace(' incorporated', '')
    company = company.replace(' inc', '')

    company = company.replace(' corp', '')
    company = company.replace(' corporation', '')
    
    company = company.replace(' limited', '')
    company = company.replace(' ltd', '')

    company = company.replace(' ', '')
    company = company.replace('-','')
    company = company.replace('_','')
    company = company.replace('&','')
    company = company.replace('.','')
    company = company.replace(',','')

    return company


def getJobTitlesFromDescription(description, name):
    # REAL CONTENT OF FUNCTION REMOVED FOR SIMPLICITY OF TEST
    return []

def resultsSeemGood(title, company):
    if len(title) < 100 and len(company) < 100:
        return True
    else:
        return False

# creates a regex from the query that searches for the word standing alone, so with no text before or after the word
def createStandaloneWordRegex(query):
    query = r"\b" + query + r"\b"

    return query

def doRequest(titleQuery, domain, company, key):
    print("key=" + key)
    q = "https://www.googleapis.com/customsearch/v1?cx=007583379591063060635%3Amuaohq-y1tu&key=" + key + "&q="

    if titleQuery:
        q = q + '+' + titleQuery
    if domain:
        q = q + '+' + domain
    if company:
        q = q + '+' + company

    try:
        r = requests.get(q).json()
        print('response to request:' + str(r))
        if r:
            print("Response do request: " + str(r))
            persons = []
            
            if r.get("items"):
                for item in r["items"]:
                    # Define vars so that they exist no matter what we find
                    name = ''
                    firstName = ''
                    lastName = ''
                    linkedIn = ''
                    description = ''
                    location = ''
                    title = ''
                    company = ''
                    photo = ''

                    personSnippet = item.get("snippet")
                    if personSnippet:
                        description = personSnippet
                    
                    personLink = item.get("link") 
                    if personLink:
                        linkedIn = personLink

                    pagemap = item.get("pagemap")
                    if pagemap:
                        hcard = pagemap.get("hcard")
                        if hcard:
                            personName = hcard[0].get("fn")
                            if personName:
                                name = personName
                                
                        else:
                            personTitle = item.get("title")
                            personTitleSplit = personTitle.split(" | ")
                            name = personTitleSplit[0]
                        
                        if name:
                            splitName = name.split(" ")
                            firstName = splitName[0]
                            lastName = name[len(firstName) + 1 : len(name)]    

                        person = pagemap.get("person")
                        if person:
                            personOrg = person[0].get("org")
                            if personOrg:
                                company = personOrg

                            personLocation = person[0].get("location")
                            if personLocation:
                                location = personLocation
                            
                            personRole = person[0].get("role")
                            if personRole:
                                title = personRole
                        
                        # cse_thumbnail and cse_image should both work, but we have found cases where the cse_image link didn't work and the thumbnail did
                        cse_image = pagemap.get("cse_thumbnail")
                        if cse_image:
                            personPhoto = cse_image[0].get("src")
                            if personPhoto:
                                photo = personPhoto
                    

                    
                    if title:
                        
                        fullTitle = title
                        
                        # catch scenario where title includes ' at ', eg: President & CEO at Acxiom
                        positionOfAt = title.find(" at ")
                        if positionOfAt > -1:
                            title = title[0 : positionOfAt]
                            print('company:' + str(company))
                        if not company or company == '':
                            print('changing company for title ' + title)
                            company = fullTitle[positionOfAt + 4 : len(fullTitle)]

                        # catch scenario like: Greater Salt Lake City Area - ‎CEO, AAPC
                        positionOfComma = fullTitle.find(", ")
                        companyInTitle = fullTitle[ positionOfComma + 2 : len(fullTitle) ]
                        if positionOfComma > -1:
                            if not company: 
                                company = companyInTitle
                            else:
                                # check if what's after the comma is the company name, if so: remove it from the title
                                if companyInTitle == company:
                                    title = fullTitle[ 0 : positionOfComma ]

                    # Sometimes the description contains the location, should look like this:  Location: Antwerp Area, Belgium; 
                    if description and not location:
                        locationInDescriptionPosition = description.find('Location: ')
                        if locationInDescriptionPosition > -1:
                            descriptionFromLocation = description[ locationInDescriptionPosition + 10 : len(description) ]
                            
                            semicolumnPosition = descriptionFromLocation.find(";")
                            if semicolumnPosition > -1:
                                location = descriptionFromLocation[0 : semicolumnPosition];

                    # translate ' area '
                    if location:
                        location = location.replace('und Umgebung','Area')

                    persons.append({
                        "name": name,
                        "firstName": firstName,
                        "lastName": lastName,
                        "linkedIn": linkedIn,
                        "description": description,
                        "location": location,
                        "title": title,
                        "company": company,
                        "photo": photo,
                    })

            return persons

    except Exception as e:
        # if something goes wrong: try again in 10 seconds
        print(e)
        print('doing google search failed ')


def findProfiles(titleQuery, domain, company, location, requestNo):

    companyNameFromDomain = getCompanyNameFromDomain(domain)

    persons = doRequest(titleQuery, domain, company, APIKeys[requestNo % len(APIKeys)])

    profiles = [];

    for person in persons:
        print('person:' + str(person))

        linkedInSplit = person["linkedIn"].split('linkedin.com/in/')
        if (len(linkedInSplit) > 1):
            preProfileId = linkedInSplit[1]
        else:
            preProfileId = ''
        username = preProfileId.split('/')[0]
        description = person["description"].lower()

        # get existing contact
        profile = contacts.find_one({"username": username})
        
        jobTitlesFromDescription = getJobTitlesFromDescription(description, person["name"])

        if profile:
            # if profile already exists: check if we need to add the description to the descriptions array
            descriptionFound = False
            if profile["descriptions"]: 
                for desc in profile["descriptions"]:
                    if desc == description:
                        descriptionFound = True
                descriptions = profile["descriptions"]

                # add description if it is not in the array yet
                if not descriptionFound:
                    descriptions.append(description)
            else:
                descriptions = []
            

            jobTitleInDescriptionFound = False
            if profile["titlesInDescriptions"]:
                for title in profile["titlesInDescriptions"]:
                    if title == jobTitlesFromDescription:
                        jobTitleInDescriptionFound = True
                titlesInDescriptions = profile["titlesInDescriptions"]

                # add jobTitlesInDescription if it is not in the array yet
                if not jobTitleInDescriptionFound:
                    titlesInDescriptions.append(jobTitlesFromDescription)
            else:
                titlesInDescriptions = []
             
        else:
            # if profile doesnt exist yet: create a new descriptions array
            if description:
                descriptions = [description]
            else:
                descriptions = []

            if jobTitlesFromDescription:
                titlesInDescriptions = [jobTitlesFromDescription]
            else:
                titlesInDescriptions = []

        # print('type username:' + str(type(username)))
        personUpsert = {
                "username": username.encode('utf-8','replace').decode('utf-8', 'replace'),
                "name": person["name"],
                "firstName": person["firstName"].lower(),
                "lastName": person["lastName"].lower(),
                "title": person["title"],
                "titleLowercase": person["title"].lower(),
                "titlesInDescriptions": titlesInDescriptions,
                "linkedIn": 'https://www.linkedin.com/in/' + username,
                "photo": person["photo"],
                "location": person["location"],
                "domain": domain,
                "company": person["company"],
                "companyLowercase": person["company"].lower(),
                "cleanCompany": getCleanCompanyName(person["company"]),
                "descriptions": descriptions,
                "updatedAt":  datetime.now().isoformat(),
            }

        
        # only store contacts if we have at least one title
        if len(person["title"]) > 0 or len(titlesInDescriptions) > 0:
            if(profile and profile["_id"]):
                print('updating ' + username)
                contacts.update({"username": username}, personUpsert)
            else:
                print('inserting ' + person["name"] + ' name length: ' + str(len(person["name"])))
                personUpsert["createdAt"] = datetime.now().isoformat()
                contacts.insert(personUpsert)
                print(person["name"], person["title"])

            profiles.append({'name': personUpsert['name'], 'title': personUpsert['title'],
                             'location': personUpsert['location'], 'linkedIn': personUpsert['linkedIn'],
                             'photo': personUpsert['photo']})

    return True, profiles

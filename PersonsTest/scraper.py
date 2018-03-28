# Imports
import requests
import json
from config import endpoint, useProxies
from flask import Flask, request, url_for, json, jsonify
import sys
from time import sleep
from library import findProfiles

sys.setrecursionlimit(1<<30)

def next_query():
    try:
        r = requests.get(endpoint + "/get").json()
        if r and r['success']:
            print("Next query: " + str(r["query"]))
            return r["query"], r['requestNo']
        else:
            print(r)
            print('No query to scrape. Sleep for 2 seconds')
            sleep(2)
            return next_query()
    except Exception as e:
        # if something goes wrong: try again in 10 seconds
        print(e)
        print('endpoint /get not available, trying again in 10 seconds')
        sleep(10)
        return next_query()

def postReady(payload, numberOfAttempts = 0):
    headers = {'content-type': 'application/json'}
    try:
        data = json.dumps(payload)
    except Exception as e:
        print(e)
        print(payload)
        print('Could not convert json...')
        data = {}

    # try sending the response
    try:
        response = requests.post(endpoint + '/set', data=data, headers=headers)
    except Exception as e:
        # if something goes wrong: try again in 10 seconds
        print('error posting ready:' + e)
        if numberOfAttempts < 10:
            numberOfAttempts = numberOfAttempts + 1
            print('endpoint /set not available, trying again in 1 minute. Attempt number ' + str(numberOfAttempts) )
            sleep(60)
            return postResult(payload, numberOfAttempts)


def run():
    nextQuery, requestNo = next_query()
    print('nextQuery:' + str(nextQuery))

    success, data = findProfiles(nextQuery["title"], nextQuery["domain"], nextQuery["company"], '', requestNo)

	# when ready, send the id of the query we did as a response
    response = {}
    response["_id"] = nextQuery["_id"]
    response["success"] = success
    response["data"] = data
    postReady(response, 0)
    run()
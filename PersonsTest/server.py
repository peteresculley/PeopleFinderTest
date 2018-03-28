from flask import Flask, request, url_for, json, jsonify
from library import findProfiles
from json_helper import json_response


app = Flask(__name__)


# location:5000/?domain=taglayer&title=cto&location=belgie
@app.route('/', methods=['GET'])
def find():

    # domain
    if request.args.get('domain'):
        domain = request.args.get('domain')
    else:
        domain = ""

    # company
    if request.args.get('company'):
        company = request.args.get('company')
    else:
        company = ""

    # Location
    if request.args.get('location'):
        location = request.args.get('location')
    else:
        location = ""

    # Name
    if request.args.get('title'):
        title = request.args.get('title')
    else:
        title = ""

    # Is this already queried?
    result = {
        "input": {
            "domain": domain,
            "company": company,
            "title": title,
            "location": location
        },
        "prospects": findProfiles(title, domain, company, location)
    }

    return json_response(result)


if __name__ == '__main__':
    print('Running Flask Server')
    app.run(host='0.0.0.0', port=5000, debug=False)

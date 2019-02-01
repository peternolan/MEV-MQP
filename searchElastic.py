from datetime import datetime
from elasticsearch_dsl import Index, Document, Text, \
    analyzer, Search, Q, Boolean, InnerDoc
import os
from elasticsearch_dsl.connections import connections
import sys
import json


# THIS IS ONLY FOR DEV/DEBUGGING
connections.create_connection(hosts=['localhost'])

DEBUG = False
LOGGING = True #writes some log info to ./searchlog.log

#if(len(sys.argv) > 1):
#    params = json.loads(" ".join(sys.argv[1:]))

#Read data from stdin
def read_in(string = None):
    if string != None:
        return json.loads(string)
    lines = sys.stdin.readlines()
    return json.loads("".join(lines))

if DEBUG:
    params = read_in(string='{"search_string":"patient","start":0,"size":3}')
else:
    params = read_in()

if LOGGING:
    outfile = open("./searchlog.log", mode='w+')
    outfile.write(json.dumps(params))
    outfile.write("\n\n\n----------------------------------------\n\n\n")

reportsIndex = Index("reports")
reportsIndex.open()
reportsIndex.refresh()

fields_string = "primaryid, drugname, me_type, age_year, sex, wt_lb, report_text" #if modifying the fields, be sure to update them in the Report class as well as the call to save, AND in the searchElastic.py file.
fields = list(map(str.strip, fields_string.split(",")))

def genSearch(string, start=0, size=3):
    positives = ' '.join(
        filter(lambda x: not x.startswith("!"), string.split(" ")))
    negatives = ' '.join(
        filter(lambda x: x.startswith("!"), string.split(" ")))
    if not positives:
        pass
        #print("NO POSITIVE SEARCH TERMS FOUND")

    search = Search()\
            .from_dict({"from": start, "size": size}) \
            .query(Q("multi_match", query=positives, fields=fields, fuzziness='AUTO'))
    
    if negatives:
        search = search.exclude(Q("multi_match", query=negatives, fields=fields, fuzziness='AUTO')) \

    #search = eval("search"+"".join(map(lambda x:".highlight('%s')"%x, fields))) #highlight on each field
    search = search.highlight("*")
    """
    search = search.highlight('body', fragment_size=100)\
            .highlight('drugs')\
            .highlight('advs')
            """
    search.highlight_options(order="score")  # order all highlights based on score
    return search

s = genSearch(params["search_string"], start=params["start"], size=params["size"])

results = s.execute()

resObj = {}
resObj["searchtime"] = results.took
resObj["fields_searched"] = fields
resObj["results"] = {}
index = -1
for result in results:
    index += 1
    resObj["results"][index] = {
        "id":result.meta.id,
        "score":result.meta.score,
    }
    
    for key in dir(result.meta.highlight):
        highlight = list(eval("result.meta.highlight."+key))
        resObj["results"]["index"][key+"_highlights"] = (highlight if highlight  else [])

        
if LOGGING:
    outfile.write(json.dumps(resObj))
    outfile.close()
reportsIndex.close()

print(json.dumps(resObj), file=sys.stdout)


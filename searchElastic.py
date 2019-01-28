from datetime import datetime
from elasticsearch_dsl import Index, Document, Text, \
    analyzer, Search, Q, Boolean, InnerDoc
import os
from elasticsearch_dsl.connections import connections
import sys
import json

DEBUG = True

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
    params = json.loads(read_in())

# THIS IS ONLY FOR DEV/DEBUGGING
connections.create_connection(hosts=['localhost'])


reportsIndex = Index("reports")
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

    search = eval("search"+"".join(map(lambda x:".highlight('%s')"%x, fields))) #highlight on each field

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
resObj["results"] = {}
index = -1
for result in results:
    index += 1
    resObj["results"][index] = {
        "id":result.meta.id,
        "score":result.meta.score,
        "body_highlights":  (list(result.meta.highlight.body) if hasattr(result.meta.highlight, "body") else []),
        "drugs_highlights": (list(result.meta.highlight.drugs)if hasattr(result.meta.highlight, "drugs")else []),
        "advs_highlights":  (list(result.meta.highlight.advs) if hasattr(result.meta.highlight, "advs") else [])
    }
    
    for key in dir(result.meta.highlight):
        resObj[key+"_highlights"] = list(eval("result.meta.highlight."+key))

print(json.dumps(resObj), file=sys.stdout)
#sys.stdout.write(str(type(json.dumps(resObj))))
#sys.stdout.write(json.dumps(resObj))
#sys.stdout.flush()
#sys.stdout.flush()

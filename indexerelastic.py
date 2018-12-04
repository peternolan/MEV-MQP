from datetime import datetime
from elasticsearch_dsl import Index, Document, Text, \
    analyzer, Search, Q, Boolean, InnerDoc
import os
from elasticsearch_dsl.connections import connections
import sys
import json


if(len(sys.argv) > 1):
    params = json.loads(" ".join(sys.argv[1:]))


# THIS IS ONLY FOR DEV/DEBUGGING
connections.create_connection(hosts=['localhost'])

reportsIndex = Index("reports")
if not reportsIndex.exists():
    # if the reports index does not exist, create it
    reportsIndex.create()
else:
    reportsIndex.refresh()

def listFiles(path):
    """returns a list of abspaths of files with .txt extentions in directory path"""
    allfiles = list(map(lambda s: os.path.join(path, s), filter(
        lambda s: os.path.isfile(os.path.join(path, s)), os.listdir(os.path.abspath(path)))))
    return list(filter(lambda x: x.endswith("txt"), allfiles))

reportdir = os.path.abspath("./Reports/")

class Report(Document):
    """A @Report contains the text for a report, as well as its sql unique ID"""
    uid = Text()
    body = Text()
    drugs = Text()
    advs = Text()

    class Index:
        name = "reports"

    def save(self, ** kwargs):
        # We can do some preparation/modification before saving.
        # This can eventually include populating the structured fields or
        # Modifying/populating the drug names info.
        return super(Report, self).save(** kwargs)

# create the mappings in Elasticsearch
Report.init()

def IndexFromDirectory(reportdir):
    """add/update documents to/in the index"""
    for f in listFiles(reportdir):
        with open(f, encoding="utf-8") as file:
            # print(os.path.basename(f))
            uid = os.path.basename(f)
            report = Report(meta={'id': uid}, uid=uid, body=file.read())
            if os.path.exists(f[:-3] + "drugs"):
                with open(f[:-3] + "drugs", encoding="utf-8") as drugsfile:
                    report.drugs = drugsfile.read()
            if os.path.exists(f[:-3] + "advs"):
                with open(f[:-3] + "advs", encoding="utf-8") as advsfile:
                    report.advs = advsfile.read()
            report.save()



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
            .query(Q("multi_match", query=positives, fields=["body", "drugs", "advs"]))
    
    if negatives:
        search = search.exclude(Q("multi_match", query=negatives, fields=["body", "drugs", "advs"])) \

    search = search.highlight('body', fragment_size=100)\
            .highlight('drugs')\
            .highlight('advs')
    search.highlight_options(order="score")  # order all highlights based on score
    return search

s = genSearch(params["search_string"], start=params["start"], size=params["size"])

results = s.execute()

if(len(sys.argv) == 1): #if we were NOT called via terminal
    print("Took " + str(results.took) + " ms to process this search!")
    for result in results:
        print("\n------------------------\n")
        print("ReportID: ", result.meta.id)
        print("Relevancy Score: ", result.meta.score)
        if(hasattr(result.meta.highlight, "body")):
            print(" - Highlights from Report Body - ")
            for i in range(len(result.meta.highlight.body)):
                print("Excerpt " + str(i) + ": ", result.meta.highlight.body[i])

        if(hasattr(result.meta.highlight, "drugs")):
            print(" - Highlights from Drugs - ")
            for i in range(len(result.meta.highlight.drugs)):
                print("Excerpt " + str(i) + ": ", result.meta.highlight.drugs[i])

        if(hasattr(result.meta.highlight, "advs")):
            print(" - Highlights from advs - ")
            for i in range(len(result.meta.highlight.advs)):
                print("Excerpt " + str(i) + ": ", result.meta.highlight.advs[i])

else: #if we WERE called via terminal...
    resObj = dict()
    resObj["searchtime"] = results.took
    index = -1
    for result in results:
        index += 1
        resObj[index] = {
            "id":result.meta.id,
            "score":result.meta.score,
            "body_highlights":  (result.meta.highlight.body  if hasattr(result.meta.highlight, "body") else []),
            "drugs_highlights": (result.meta.highlight.drugs if hasattr(result.meta.highlight, "drugs") else []),
            "advs_highlights":  (result.meta.highlight.advs  if hasattr(result.meta.highlight, "advs") else [])
        }
    
    print(json.dumps(resObj), file=sys.stdout)
    sys.stdout.flush()

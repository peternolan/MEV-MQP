import psycopg2 as psy
import sys
from elasticsearch_dsl import Index, Document, Text, \
    analyzer, Search, Q, Boolean, InnerDoc
from elasticsearch_dsl.connections import connections

import datetime as dt
timenow = dt.datetime.now

lasttime = timenow()

# THIS IS ONLY FOR DEV/DEBUGGING
connections.create_connection(hosts=['localhost'])


class Report(Document):
    """A @Report contains the text for a report, as well as its sql unique ID"""
    primaryid = Text()
    drugname = Text()
    me_type = Text()
    age_year = Text()
    sex = Text()
    wt_lb = Text()
    report_text = Text()

    class Index:
        name = "reports"

    def save(self, ** kwargs):
        # We can do some preparation/modification before saving.
        # This can eventually include populating the structured fields or
        # Modifying/populating the drug names info.
        return super(Report, self).save(** kwargs)

Report.init()

reportsIndex = Index("reports")

try:
    if reportsIndex.is_closed(): reportsIndex.open()
except: pass

reportsIndex.refresh()

if not reportsIndex.exists():
    # if the reports index does not exist, create it
    reportsIndex.create()

try:
    if reportsIndex.is_closed(): reportsIndex.open()
except: pass


print("connecting to Index and creating reports class took "+ str((timenow() - lasttime).total_seconds()) + " sec")
lasttime = timenow()

#here we connect to the faers database
#CHANGE THE PARAMETERS TO CONNECT EXTERNALLY/TO A DIFFERENT DATABASE
try:
    connection = psy.connect(host="localhost", database="faers", user=sys.argv[1])
except IndexError as e:#assign e to a variable, as this is only doable in python 3+ (a haphazard version check)
    print("INCORRECT USAGE :  python3 ./databaseindexer.py <faers database username>")
    

cursor = connection.cursor()
fields_string = "primaryid, drugname, me_type, age_year, sex, wt_lb, report_text" #if modifying the fields, be sure to update them in the Report class as well as the call to save, AND in the searchElastic.py file.
fields = list(map(str.strip, fields_string.split(",")))
command = "SELECT DISTINCT "+fields_string+" FROM reports WHERE primaryid != '-1' ORDER BY primaryid"
cursor.execute(command)

row = cursor.fetchone()
prevtime = timenow()
updatestr = ''

print("connecting to faers database and establishing cursor took "+ str((timenow() - lasttime).total_seconds()) + " sec")
lasttime = timenow()


while row is not None:
    dt = (timenow() - prevtime).total_seconds() #delta time since last time 1 second passed - used for printing
    cdt = (timenow() - lasttime).total_seconds() #cumulative delta time, since entering this while loop - used for estimated time remaining
    if dt > 1:
        prevtime = timenow()
        sys.stdout.write("\b"*(len(updatestr)//2))
        updatestr = "%"+(str(100*cursor.rownumber/cursor.rowcount)+"00000")[0:5] +"        --        "+ str(cursor.rownumber)+"/"+str(cursor.rowcount) +" rows indexed      --      ~" + (str(cdt*(cursor.rowcount/cursor.rownumber - 1)/60)+"000000")[0:5] + "min left" 
        sys.stdout.write("\r"+updatestr)
        sys.stdout.flush()
    try:
        primaryid = str(int(row[0]))
        drugname = " ".join(row[1])
        me_type = row[2]
        age_year = row[3]
        sex = row[4]
        wt_lb = row[5]
        report_text = row[6]
        report = Report(primaryid = primaryid,
                        drugname = drugname,
                        me_type = me_type,
                        age_year = age_year,
                        sex = sex,
                        wt_lb = wt_lb,
                        report_text = report_text)
        report.save()
    except Exception as e:
        print(e)

    row = cursor.fetchone()

reportsIndex.save()
reportsIndex.close()
cursor.close()
connection.close()

print("building the full index from the database took "+str((timenow() - lasttime).total_seconds()) + " sec")
lasttime = timenow()


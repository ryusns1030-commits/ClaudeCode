# page order in file 04 (1-based): ID,pose per page
IDS=list(range(46,61))+[66,67,70,71,76,81,86,94,96,131]
def page_of(i,pose): return IDS.index(i)*2+(1 if pose=='normal' else 2)

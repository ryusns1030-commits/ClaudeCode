import json
from lib import *
def load(name):
  return json.load(open(f"{name}.base.ops.json")),json.load(open(f"{name}.base.fmt.json"))
def finish(name,ops,fmt,p):
  p.ops=ops+p.ops; p.fmt=fmt+p.fmt; emit(p,name)

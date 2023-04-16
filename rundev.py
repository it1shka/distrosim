#!/usr/bin/env python3
from subprocess import Popen
import os

def determine_port():
  if not os.path.exists('.env'):
    return None
  with open('.env', 'r') as file:
    for line in map(lambda e: e.strip(), file):
      if not line or '=' not in line: continue
      key, value = line.split('=')
      if key == 'PORT': return value
  return None

commands = [
  'nodemon --ext "go" --exec "go run ." --signal SIGTERM',
  'sass --watch --no-source-map styles:assets',
  'nodemon --ext "ts" --watch client --exec "tsc"',
]

port = determine_port()
if port:
  host = f'http://localhost{port}'
  open_command = 'sleep 2 && ' + (f'open {host}' if os.name == 'posix' else f'start {host}')
  commands.append(open_command)

processes = [Popen(c, shell=True) for c in commands]
try:
  for proc in processes: proc.wait()
except:
  print('Done')

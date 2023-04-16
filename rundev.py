#!/usr/bin/env python3
from subprocess import Popen
from textwrap import dedent
import os

with open('.env', 'w') as env:
  env.write(dedent('''
    GIN_MODE=debug
    PORT=:3000
  '''))

host = 'http://localhost:3000'

commands = [
  'nodemon --ext "go" --exec "go run ." --signal SIGTERM',
  'sass --watch --no-source-map styles:assets',
  'nodemon --ext "ts" --watch client --exec "tsc"',
  'sleep 2 && ' + (f'open {host}' if os.name == 'posix' else f'start {host}')
]

processes = [Popen(c, shell=True) for c in commands]
try:
  for proc in processes: proc.wait()
except:
  print('Done')

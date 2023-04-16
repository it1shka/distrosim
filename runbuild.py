#!/usr/bin/env python3

from textwrap import dedent
import subprocess
import os

def get_port():
  while True:
    try:
      port = int(input('Select port: '))
      if port > 0:
        return port
      print('Port value should be positive')
    except ValueError:
      print('Port value should be integer')

def prompt_boolean(prompt):
  while True:
    answer = input(f'{prompt} [Y/n]: ').lower()
    if not answer or answer == 'y':
      return True
    if answer == 'n':
      return False

port = get_port()

def run_release():
  running = subprocess.Popen('go run main.go', shell=True)
  host = f'http://localhost:{port}'
  open_command = 'sleep 2 && ' + (f'open {host}' if os.name == 'posix' else f'start {host}')
  subprocess.Popen(open_command, shell=True)
  running.wait()

with open('.env', 'w') as env:
  env.write(dedent(f'''
    GIN_MODE=release
    PORT=:{port}
  '''))

subprocess.run(['tsc'])
subprocess.run(['sass', '--no-source-map', 'styles:assets'])

if prompt_boolean('Do you want to run release?'):
  run_release()
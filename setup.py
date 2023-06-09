#!/usr/bin/env python3

import os
from textwrap import dedent
import subprocess

# checking whether all the necessary files are prepared

if not os.path.exists('assets'):
  print('No "assets/" folder was found')
  try:
    os.makedirs('assets')
    print('Created "assets/" folder')
  except:
    print('Failed to create "assets/"')

if not os.path.exists('.env'):
  print('No ".env" file was found')
  try:
    with open('.env', 'w') as file:
      content = dedent('''
        GIN_MODE=debug
        PORT=:3000
        DB_FILE=database.db
      ''').strip()
      file.write(content)
      print(f'Created ".env" file with the following content: \n{content}')
  except:
    print('Failed to create ".env"')

# checking system installs

def node_installed():
  try:
    subprocess.run(['node', '-v'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return True
  except FileNotFoundError:
    return False

if not node_installed():
  print('Node JS is not installed on the computer. Please install it')
  subprocess.run(['open', 'https://nodejs.org/en' ])
  exit(1)

dependencies = ['nodemon', 'typescript', 'sass']
print('Setting up the following dependencies: ')
for dep in dependencies:
  print(f'Installing {dep}...')
  subprocess.run(['npm', 'install', '-g', dep])
  print('Done!')

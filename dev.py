#!/usr/bin/env python3

import os
from textwrap import dedent

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
        PORT=3000
      ''')
      file.write(content)
      print(f'Created ".env" file with the following content: {content}')
  except:
    print('Failed to create ".env"')


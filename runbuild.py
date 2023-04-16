#!/usr/bin/env python3

from subprocess import run
from textwrap import dedent

ts_error = run(['tsc'], capture_output=True, text=True).stderr
sass_error = run(['sass', '--no-source-map', 'styles:assets'], capture_output=True, text=True).stderr

if ts_error:
  print('TypeScript errors: ')
  print(ts_error)

if sass_error:
  print('SASS errors: ')
  print(sass_error)

if not ts_error and not sass_error:
  message = dedent('''
    Build completed without any errors.

    Now you can modify your .env file:

    PORT=<actual port, see documentation for HTTP and HTTPS common ports>
    GIN_MODE=release

    and after that to run project in production, type:

    $ go run main.go
  ''').strip()
  print(message)
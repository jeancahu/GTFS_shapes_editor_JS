## Debug

Javascript with debug code

```bash
npm run debug             # creates the JS for debug
# npm run dist            # creates the JS for production

cd test/server_demo
./manage.py runserver
```

## Build

Change the package version \_\_version\_\_.py and into setup.py

```bash
./setup.py dist          # create the package (virtualenv needed)
```

## Publish

```bash
twine upload dist/*
```


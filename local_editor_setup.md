# Local editor setup

- Clone the repository: `git clone "https://github.com/jeancahu/GTFS_shapes_editor_JS"` </br>

- Get into the repository and install npm dependencies
```bash
cd GTFS_shapes_editor_JS/
npm install .
npm run debug
```

- Install Python dependencies inside virtualenv
```bash
cd test/server_demo
virtualenv --python python3.9 venv_server
source venv_server/bin/activate
pip install django
```

- Installing Shapeeditor is not necessary due it is already local. Create database
```bash
./manage.py makemigrations
./manage.py makemigrations shapeeditor
./manage.py migrate
```

- Create a superuser for database management
```bash
./manage.py createsuperuser --username shapeeditor --email shapeeditor@shapeeditor.com
```
Use _shapeeditor_ as password too, insert it two times and ignore the warning typing "y" and enter.

- Run the local server to visualize the web app
```bash
./manage.py runserver localhost:8090
```
Get into the URL http://localhost:8090/shapeeditor using your favorite web browser, ingress username _shapeeditor_ and password _shapeeditor_ </br>
Ingress http://localhost:8090/admin/shapeeditor/history/ for saved shape list.

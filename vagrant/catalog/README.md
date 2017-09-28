# fsnd_p4_catalog

## Install & Run

You can skip this and view an online version, linked in the View section.

* Make sure [vagrant](https://www.vagrantup.com/) is installed.

* Clone this repo with `git clone git@github.com:arccoza/fsnd_p4_catalog.git catalog` into your FSND VM `catalog` directory (must be a newer, Ubuntu 16.04 version FSND VM).

* Or clone my FSND VM with this project included: `git clone git@github.com:arccoza/fsnd_p3_vm.git`.

* From the terminal inside the project directory run `vagrant up`.

* SSH into the VM from the terminal once the VM is up: `vagrant ssh`.

* Move into the project directory in the VM: `cd /vagrant/catalog`.

* Run `pip3 install -r requirements.txt -t lib` to install dependencies.

* Run the dev server with `python3 app.py`.

## View

* On your host machine open: [http://localhost:5000/](http://localhost:5000/). You must use `localhost` and not `127.0.0.1` or `0.0.0.0` for oauth to work.

* Or you can view an online version [here](http://188.166.100.114.xip.io/).

## Use

From the top left of the page you can open a side panel that will allow you to navigate by category or return home.

From the top right you can signin or signup with a Facebook or Google account.

If you are signed-in a FAB button in the bottom right should appear allowing you to add Categories and Items.

When you are signed-in you can edit Categories and Items by clicking on the pencil icon next to each.

## API

* `GET /api/catalog/` - retrieves all data for the catalog, returns JSON.
* `GET /api/catagories/` - get all the categories, returns JSON.
* `GET /api/catagories/{id}` - get the category for this `id`, returns JSON.
* `POST /api/catagories/` - create a new category, expects JSON, returns the new `id` as JSON.
* `PUT /api/catagories/{id}` - update a category by id, expects JSON, returns JSON.
* `DELETE /api/catagories/{id}` - delete a category by id, expects JSON, returns JSON.
* `GET /api/items/` - get all the items, returns JSON.
* `GET /api/items/{id}` - get the item for this `id`, returns JSON.
* `POST /api/items/` - create a new item, expects JSON, returns the new `id` as JSON.
* `PUT /api/items/{id}` - update an item by id, expects JSON, returns JSON.
* `DELETE /api/items/{id}` - delete an item by id, expects JSON, returns JSON.
* `GET /api/files/` - get all the files, returns JSON.
* `GET /api/files/{id}` - get the file for this `id`, returns JSON.
* `POST /api/files/` - create a new file, expects JSON, returns the new `id` as JSON.
* `PUT /api/files/{id}` - update a file by id, expects JSON, returns JSON.
* `DELETE /api/files/{id}` - delete a file by id, expects JSON, returns JSON.
* `GET /api/files/{id}/blob` - when getting file data, the binary data is excluded; avoids huge return data. To get only the binary data for a `file`, append `/blob` to the url. Returns bytes with the appropriate mime-type. 


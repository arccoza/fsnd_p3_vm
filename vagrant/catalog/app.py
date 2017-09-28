import locallib
from flask import Flask, render_template, url_for, session
from flask.sessions import SecureCookieSessionInterface
from api import api_bp
from models import db
import psycopg2 as psql


secret_key = 'taU>5&(Z*+r2d5ULR|i2z$bt@+ 9|i,;u!N_2);v@i/@y;gUf/&0WXC?}g6<aK$H'
app = Flask(__name__, static_folder='pub', static_url_path='/static')
app.secret_key = secret_key
app.register_blueprint(api_bp, url_prefix='/api')

# Ref: http://stackoverflow.com/questions/34484066/create-a-postgres-database-using-python
# Create the required database if it doesn't exist.
con = psql.connect(dbname='postgres')
con.autocommit = True
cur = con.cursor()
try:
    # cur.execute('DROP DATABASE catalog;')
    cur.execute('CREATE DATABASE catalog;')
except:
    pass

db.bind('postgres', database='catalog')
db.generate_mapping(create_tables=True)


# Only one catchall route required because this is a single page React app.
@app.route('/')
@app.route('/<path:path>')
def root(cat=None, id=None, path=None):
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

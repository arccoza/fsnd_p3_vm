from flask import Blueprint, Response, request, url_for, session, current_app,\
    make_response, abort
from models import User, Item, Category, select, db_session, commit, rollback,\
    Set, SetInstance, ObjectNotFound, Password, OAuth
import json
from functools import wraps
import base64
import random
import string
from datetime import datetime
import requests
import oauth
import os


# REF: https://stackoverflow.com/questions/12081789/pythons-working-directory-when-running-with-wsgi-and-apache
here = os.path.dirname(__file__)
with open(os.path.join(here, 'client_secrets.json')) as f:
    client_secrets = json.load(f)


def authorize(upgrade=True):
    '''
    Authorize a user with oauth or a custom user & pw scheme.
    '''
    def deco(fn):
        @wraps(fn)
        def wrap(*args, **kwargs):
            kind = None
            # Grab the session cookie if it exists.
            cookie = request.cookies.get(current_app.session_cookie_name, None)

            # Try get the Auth header data.
            try:
                auth = request.headers['Authorization']
                kind, _, value = auth.partition(' ')
                if kind == 'Basic':
                    value = base64.standard_b64decode(bytes(value, 'utf8'))
                    id, _, pw = str(value, 'utf8').partition(':')
                elif kind == 'Google' or kind == 'Facebook':
                    xtra = request.headers['X-Requested-With']
                # elif kind == 'Token':
            except (KeyError, base64.binascii.Error) as ex:
                # print(type(ex))
                return fn(*args, **kwargs)

            # If there was an Auth header, autheticate with that info,
            # and create a session.
            if kind == 'Basic':
                with db_session:
                    user = select(u for u in User
                                  if u.email == id or u.username == id)[:]
                if len(user) == 1:
                    if Password.verify(pw, user[0].password):
                        sessionize(user=user[0].to_dict())
                    else:
                        session.clear()
                elif not user:
                    with db_session:
                        user = User(email=id, password=pw)
                    sessionize(user=user.to_dict())
                else:
                    session.clear()
            elif kind in ('Google', 'Facebook') and xtra == 'Fetch':
                kind = kind.lower()
                sec = client_secrets[kind]['web']
                sec['provider'] = kind
                sec['token'] = value
                try:
                    value = oauth.upgrade_token(**sec)
                    ouser = oauth.get_user(provider=kind, **value)
                    print(ouser)
                    with db_session:
                        user_oauth = select(o for o in OAuth
                                            if o.puid == ouser['id'])[:]
                        if len(user_oauth) == 1:
                            print(user_oauth[0].user)
                            user = user_oauth[0].user.to_dict(
                                ('password', 'oauth'))
                            try:
                                user['picture'] =\
                                    ouser['picture']['data']['url']
                            except TypeError as ex:
                                user['picture'] = ouser.get('picture', '')
                            sessionize(user=user)
                        elif not user_oauth:
                            # with db_session:
                            user = User(
                                name=ouser.get('name'))
                            user_oauth = OAuth(
                                provider=kind,
                                puid=ouser.get('id'),
                                access_token=value.get('access_token', ''),
                                refresh_token=value.get('refresh_token', ''),
                                user=user)
                            commit()
                            user = user.to_dict(('password', 'oauth'))
                            try:
                                user['picture'] =\
                                    ouser['picture']['data']['url']
                            except TypeError as ex:
                                user['picture'] = ouser.get('picture', '')
                            sessionize(user=user)
                except oauth.HTTPError as ex:
                    abort(make_response(ex.text, ex.status_code))
            elif kind is not None:  # An unknown kind or kind 'None'
                session.clear()

            return fn(*args, **kwargs)
        return wrap
    return deco


def sessionize(**kwargs):
    '''
    Set the session with the provided keyword values,
    and some unique, generated values.
    '''
    pop = string.ascii_uppercase + string.digits
    session['state'] = ''.join(random.choice(pop) for _ in range(32))
    session['timestamp'] = datetime.now().timestamp()
    session.update(kwargs)

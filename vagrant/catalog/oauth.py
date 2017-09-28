import requests
from requests import HTTPError


def upgrade_token(**kwargs):
    '''
    Upgrade a client side token, from the browser,
    to one that can be used on the server.

    Required kwargs:
        provider
        token
        client_id
        client_secret
    '''
    provider = kwargs.pop('provider').lower()
    token = kwargs.pop('token')
    if provider == 'google':
        url = 'https://accounts.google.com/o/oauth2/token'
        kwargs['code'] = token
        kwargs['redirect_uri'] = 'postmessage'
        kwargs['grant_type'] = 'authorization_code'
        r = requests.Request(method='POST', url=url, data=kwargs)
    elif provider == 'facebook':
        kwargs['fb_exchange_token'] = token
        url = 'https://graph.facebook.com/oauth/access_token'
        kwargs['grant_type'] = 'fb_exchange_token'
        r = requests.Request(method='GET', url=url, params=kwargs)
    else:
        raise Exception('Unknown provider.')

    r = r.prepare()
    with requests.Session() as s:
        r = s.send(r)
    try:
        r.raise_for_status()
    except requests.HTTPError as ex:
        ex.text = ex.response.text
        ex.json = ex.response.json()
        ex.status_code = ex.response.status_code
        raise
    return r.json()


def get_user(**kwargs):
    '''
    Get the user from the oauth provider.

    Required kwargs:
        provider
        access_token
    '''
    provider = kwargs.pop('provider').lower()
    access_token = kwargs.pop('access_token')
    headers = {'Authorization': 'Bearer ' + access_token}

    if provider == 'google':
        url = 'https://www.googleapis.com/oauth2/v1/userinfo'
        params = {}
    elif provider == 'facebook':
        url = 'https://graph.facebook.com/me'
        params = {'fields': 'id,name,email,picture'}

    r = requests.Request(method='GET', headers=headers, url=url, params=params)
    r = r.prepare()
    with requests.Session() as s:
        r = s.send(r)
    try:
        r.raise_for_status()
    except requests.HTTPError as ex:
        ex.text = ex.response.text
        ex.json = ex.response.json()
        ex.status_code = ex.response.status_code
        raise
    return r.json()

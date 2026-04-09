{
    'name': 'SF Pong',
    'version': '1.0',
    'summary': 'Plays Pong when offline instead of showing a connection error',
    'depends': ['web'],
    'data': ['views/pong_offline.xml'],
    'assets': {
        'web.assets_web': [
            'sf_pong/static/src/js/pong_offline.js',
        ],
    },
    'auto_install': False,
}

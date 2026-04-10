# -*- coding: utf-8 -*-
{
    'name': 'Space Invaders',
    'version': '19.0.1.0.0',
    'summary': 'Mini juego Space Invaders integrado en Odoo',
    'description': """
        Módulo que agrega un mini juego de Space Invaders accesible
        desde el menú principal de Odoo. ¡Destruye los invasores espaciales!
    """,
    'category': 'Extra Tools',
    'author': 'Eduardo',
    'website': '',
    'license': 'LGPL-3',
    'depends': ['web'],
    'data': [
        'views/space_invaders_views.xml',
        'views/space_invaders_menus.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'space_invaders/static/src/css/space_invaders.css',
            'space_invaders/static/src/js/space_invaders_action.js',
        ],
    },
    'images': [],
    'installable': True,
    'application': True,
    'auto_install': False,
}

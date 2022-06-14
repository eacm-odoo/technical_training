# -*- coding: utf-8 -*-

{
    'name': 'Odoo Volunteers',
    'summary': """Volunteer app to manage volunteer and the shop""",
    'description': """
        Volunteer Module to manage:
        - Organize Volunteers
        - Shop:
            -Selling local products
    """,
    'author': 'EduardoCedillo(eacm)',
    'category': 'Volunteer',
    'version': '0.1',
    'depends': ['base'],
    'data': [
        'security/volunteers_security.xml',
        'security/ir.model.access.csv',
        'views/volunteers_menuitems.xml',
        'views/task_views.xml',
        
    ],
    'demo': [
        'demo/volunteer_demo.xml',
        'demo/tasks_demo.xml',
    ],
}
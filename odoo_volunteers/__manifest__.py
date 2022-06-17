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
    'depends': ['approvals','base', 'website'],
    'data': [
        'security/volunteers_security.xml',
        'security/ir.model.access.csv',
        'views/volunteers_menuitems.xml',
        'views/task_views.xml',
        'views/car_views.xml',
        'views/approval_views_inherit.xml',
        'wizard/task_wizard_view.xml',
        'report/task_report_templates.xml',
        'report/volunteer_report_templates.xml',
        'views/volunteer_views_inherit.xml',
        'views/volunteers_web_templates.xml',
    ],
    'demo': [
        #'demo/volunteer_demo.xml',
        'demo/tasks_demo.xml',
    ],
}
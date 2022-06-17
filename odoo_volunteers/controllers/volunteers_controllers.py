# -*- coding: utf-8 -*-

from odoo import http

class Volunteers(http.Controller):
    @http.route('/volunteers/', auth='public', website=True)
    def index(self, **kw):
        return "Hello, world"

    @http.route('/volunteers/tasks/', auth='public', website=True)
    def tasks(self, **kw):
        tasks = http.request.env['volunteers.task'].search([])
        return http.request.render('odoo_volunteers.task_website', {
            'tasks': tasks
            })


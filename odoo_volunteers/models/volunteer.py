# -*- coding: utf-8 -*-

from odoo import models, fields, api

class Volunteer(models.Model):
    
    _inherit = 'res.partner'

    task_ids= fields.Many2many(comodel_name='volunteers.task', string='Volunteers')
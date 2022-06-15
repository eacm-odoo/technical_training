# -*- coding: utf-8 -*-
from odoo import models, fields, api

class Car(models.Model):
    _name = 'volunteers.car'
    _description = 'Car Info'

    name = fields.Char(string='Car name', required=True)
    
    task_id = fields.Many2one(comodel_name='volunteers.task',
                               string='Task',
                               required=True,
                               ondelete='cascade')
    model = fields.Char(string='Model')
    year = fields.Integer(string='Year', default=None)
    description = fields.Text(string='Description')
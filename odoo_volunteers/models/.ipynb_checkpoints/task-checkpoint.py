# -*- coding: utf-8 -*-

from odoo import models, fields, api

class Task(models.Model):
    
    _name = 'volunteers.task'
    _description = 'Task Info'
    
    
    name = fields.Char(string='Title', required=True)
    description = fields.Text(string='Description')
    
    startTime = fields.Datetime(string='startTime', required=True)
    stopTime = fields.Datetime(string='stopTime', required=True)
    
    type = fields.Selection(string='TaskType', 
                               selection=[('seller', 'Seller'),
                                          ('carer', 'Carer'),
                                          ('loader', 'Loader'),
                                          ('distributor', 'Distributor')],
                               copy=False)
    
    repeat = fields.Boolean(string='Repeat', default=False)
    frequency = fields.Integer(string='Frequency', default=1)
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

    state = fields.Selection(string='State',
                                 selection=[('draft', 'Draft'),
                                            ('ready', 'Ready'),
                                            ('in-progress', 'In-Progress'),
                                            ('done', 'Done'),
                                            ('cancelled', 'Cancelled')],
                                    default='draft')
    leader_id =fields.Many2one(comodel_name='res.partner',string='Leader')
    volunteer_ids= fields.Many2many(comodel_name='res.partner', string='Volunteers')

    @api.onchange('leader')
    def _onchange_leader(self):
        if self.leader:
            self.state = 'ready'

# -*- coding: utf-8 -*-

from odoo import models, fields, api

class Volunteer(models.Model):
    
    _name = 'volunteers.volunteer'
    _description = 'Volunteer Personal Info'
    
    name = fields.Char(string='Name', required=True)
    description = fields.Text(string='Description')
    
    position = fields.Selection(string='JobPosition', 
                               selection=[('intern', 'Intern'),
                                          ('junior', 'Junior'),
                                          ('senior', 'Senior')],
                               copy=False)
    
    active = fields.Boolean(string='Active', default=True)
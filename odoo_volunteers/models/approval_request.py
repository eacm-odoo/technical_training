# -*- coding: utf-8 -*-
from odoo import models, fields, api

class ApprovalRequest(models.Model):
    _inherit = 'approval.request'

    task_id = fields.Many2one(comodel_name='volunteers.task',
                                string='Related Task',
                                ondelete='set null')

    leader_id = fields.Many2one(string='Tasks Leader',
                                    related='task_id.leader_id',
                                    readonly=True)
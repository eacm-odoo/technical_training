# -*- coding: utf-8 -*-

from email.policy import default
from odoo import models, fields, api

class TaskWizard(models.TransientModel):
    _name = 'volunteers.task.wizard'
    _description = 'Wizard: Quick Tasks asigment to volunteers'

    def _default_session(self):
        return self.env['academy.session'].browse(self._context.get('active_id'))

    task_id = fields.Many2many(comodel_name='volunteers.task',
                                string='Task',
                                required=True)

    task_volunteer_ids = fields.Many2many(comodel_name='res.partner',
                                            string='Volunteers with Task',
                                            related='task_id.volunteer_ids',
                                            help='These are the volunteers with tasks asigned')

    volunteer_id = fields.Many2one(comodel_name='res.partner',
                                    string='Volunteers ready for task')

    def assing_tasks(self):
        #task_id = self.env['volunteers.task'].search([('is_session_product', '=', True)], limit=1)
        for task in self.task_id:
            task.volunteer_ids |= self.volunteer_id
        return True

from xmlrpc import client

from requests import session

url = 'http://localhost:8069/'
db = '15.0-dev-volunteers'
username = 'admin'
password = 'admin'

common = client.ServerProxy('{}/xmlrpc/2/common'.format(url))
print(common.version())

uid = common.authenticate(db, username, password, {})
print(uid)

models = client.ServerProxy('{}/xmlrpc/2/object'.format(url))

model_access = models.execute_kw(db, uid, password,
                                'volunteers.task','check_access_rights',
                                 ['write'], {'raise_exception': False})
print(model_access)

with_out_task = models.execute_kw(db, uid, password,
                                    'res.partner', 'search',
                                    [[['task_ids', '=', False]]])
print(with_out_task)
#search for all tasks
tasks = models.execute_kw(db, uid, password,
                                    'volunteers.task', 'search',
                                    [[]])

#add a task to a volunteer
task_id = models.execute_kw(db, uid, password,
                            'volunteers.task', 'write',
                            [[tasks[0]],{'volunteer_ids': [(4, with_out_task[0])]}])
print(task_id)

with_out_task2 = models.execute_kw(db, uid, password,
                                    'res.partner', 'search',
                                    [[['task_ids', '=', False]]])
print(with_out_task2)

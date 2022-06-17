from xmlrpc import client

from requests import session

url = 'http://localhost:8069/'
db = '15-dev-acade'
username = 'admin'
password = 'admin'

common = client.ServerProxy('{}/xmlrpc/2/common'.format(url))
print(common.version())

uid = common.authenticate(db, username, password, {})
print(uid)

models = client.ServerProxy('{}/xmlrpc/2/object'.format(url))

model_access = models.execute_kw(db, uid, password,
                                'academy.session','check_access_rights',
                                 ['write'], {'raise_exception': False})
print(model_access)

courses = models.execute_kw(db, uid, password,
                            'academy.course','search_read',
                            [[['level', 'in', ['intermediate', 'beginner']]]])
print(courses)

course = models.execute_kw(db, uid, password,
                            'academy.course','search',
                            [[['name', '=', 'Accounting 200']]])
print(course)

session_fields = models.execute_kw(db, uid, password,
                            'academy.session','fields_get',
                            [], {'attributes': ['string', 'required', 'type']})
print(session_fields)


new_session = models.execute_kw(db, uid, password,
                            'academy.session','create',
                            [
                                {'course_id': course[0],
                                    'name': 'VR & AR',
                                    'duration': 5,
                                }
                            ])
print(new_session)
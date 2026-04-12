# -*- coding: utf-8 -*-
{
    'name': 'Voice Input for Chatter',
    'version': '19.0.1.0.0',
    'summary': 'Dicta mensajes, log notes y emails por voz en el chatter',
    'description': """
        Agrega un botón de micrófono en el compositor del chatter de Odoo.
        Usa la Web Speech API de Chrome para convertir voz a texto y rellenar
        el campo del mensaje automáticamente.
        Compatible únicamente con Google Chrome.
    """,
    'category': 'Productivity',
    'author': 'Eduardo',
    'license': 'LGPL-3',
    'depends': ['mail', 'ai'],
    'assets': {
        'web.assets_backend': [
            'mail_voice_input/static/src/voice_input_action.js',
            'mail_voice_input/static/src/ai_chat_patch.js',
            'mail_voice_input/static/src/voice_input.scss',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
}

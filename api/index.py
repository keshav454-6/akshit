import os
import sys

# Ensure current directory is in Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Import the initialized Flask app with SPA & API routes
from app import app as flask_app

class VercelPathNormalizer:
    """
    WSGI middleware that normalizes incoming paths from Vercel Serverless runtime.
    Strips script prefixes such as /api/index.py or /index.py and guarantees
    routes match cleanly.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')
        
        # Strip script name if Vercel included it
        for prefix in ['/api/index.py', '/index.py']:
            if path.startswith(prefix):
                path = path[len(prefix):]
                
        if not path or path == '':
            path = '/'
            
        environ['PATH_INFO'] = path
        return self.wsgi_app(environ, start_response)

app = VercelPathNormalizer(flask_app)

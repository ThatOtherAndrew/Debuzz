import quart
from .api import api

app = quart.Quart(__name__, static_url_path='/', static_folder='static')
app.register_blueprint(api)


@app.route('/')
async def index():
    return await app.send_static_file('index.html')

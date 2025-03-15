import quart

from dotenv import load_dotenv

from . import db

load_dotenv()

app = quart.Quart(__name__, static_url_path='/', static_folder='static')
from .api import api
app.register_blueprint(api)


@app.before_serving
async def before_serving():
    await db.connect(app.logger)


@app.after_serving
async def after_serving():
    await db.close(app.logger)


@app.route('/')
async def index():
    return await app.send_static_file('index.html')

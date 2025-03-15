import quart

from dotenv import load_dotenv
load_dotenv()

app = quart.Quart(__name__, static_url_path='/', static_folder='static')
from .api import api
app.register_blueprint(api)


@app.route('/')
async def index():
    return await app.send_static_file('index.html')

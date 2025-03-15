import quart

app = quart.Quart(__name__, static_url_path='/', static_folder='static')


@app.route('/')
async def index():
    return await app.send_static_file('index.html')


@app.route('/api')
async def json():
    return {'hello': 'world'}

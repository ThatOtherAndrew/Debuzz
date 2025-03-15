import quart

api = quart.Blueprint('api', __name__, url_prefix='/api')


@api.route('/')
async def json():
    return {'hello': 'world'}

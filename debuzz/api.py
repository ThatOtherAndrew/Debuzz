import quart
from quart_cors import cors
from textstat.textstat import textstat
from quart import jsonify

from . import debuzzer

api = cors(
    quart.Blueprint('api', __name__, url_prefix='/api'),
    allow_origin='*',
)


@api.route('/')
async def json():
    return {'hello': 'world'}


@api.route('/debuzz', methods=['POST'])
async def debuzz():
    body = await quart.request.get_data()
    return await debuzzer.debuzz(body.decode())


@api.route('/buzzvol', methods=['POST'])
async def get_buzz_volume():
    data = await quart.request.get_json()
    text = data.get('text', ' ')

    buzz_score = textstat.flesch_reading_ease(text)
    # the lower the reading ease the more pain it will cause
    # muahahahahhah
    buzz_volume = max(0, min(1, (100 - buzz_score) / 100))

    return {'buzz_volume': buzz_volume, 'buzz_score': buzz_score}

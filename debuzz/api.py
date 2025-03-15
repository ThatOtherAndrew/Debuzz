import quart
import textstat
from quart_cors import cors

from .buzzwords import BuzzwordChecker

api = cors(
    quart.Blueprint('api', __name__, url_prefix='/api'),
    allow_origin='*',
)
buzzwords = BuzzwordChecker.from_csv('debuzz/data/unigram_freq.csv')


@api.route('/')
async def json():
    return {'hello': 'world'}


@api.route('/debuzz', methods=['POST'])
async def debuzz(count_threshold: int | None = None, freq_threshold: int | None = None):
    body = await quart.request.get_data()
    words = body.decode().split()
    return ' '.join(
        (word if buzzwords.check(word, count_threshold,
         freq_threshold) else '*' * len(word))
        for word in words
    )


@api.route('/buzzvol', methods=['POST'])
async def get_buzz_volume():
    data = await quart.request.get_json()
    text = data.get('text', ' ')

    buzz_score = textstat.fetch_reading_ease(text)
    # the lower the reding ease the more pain it will cause
    # muahahahahhah
    buzz_volume = max(0, min(1, (100 - buzz_score) / 100))

    return jsonify({'buzz_volume': buzz_volume, 'buzz_score': buzz_score})

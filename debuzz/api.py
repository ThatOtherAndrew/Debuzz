import quart

from .buzzwords import BuzzwordChecker

api = quart.Blueprint('api', __name__, url_prefix='/api')
buzzwords = BuzzwordChecker.from_csv('debuzz/data/unigram_freq.csv')


@api.route('/')
async def json():
    return {'hello': 'world'}


@api.route('/debuzz', methods=['POST'])
async def debuzz(count_threshold: int | None = None, freq_threshold: int | None = None):
    body = await quart.request.get_data()
    words = body.decode().split()
    return ' '.join(
        (word if buzzwords.check(word, count_threshold, freq_threshold) else '*' * len(word))
        for word in words
    )

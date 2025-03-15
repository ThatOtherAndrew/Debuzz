from quart import Quart

app = Quart(__name__)


@app.route("/api")
async def json():
    return {"hello": "world"}

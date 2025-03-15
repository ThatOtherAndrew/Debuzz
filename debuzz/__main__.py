if __name__ == '__main__':
    from .app import app
    app.run(host='localhost', port=80, debug=True)

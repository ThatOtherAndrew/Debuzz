from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from logging import Logger

import aiosqlite

cache: aiosqlite.Connection | None = None


async def connect(logger: Logger):
    global cache
    logger.debug('Connecting to cache.db')

    cache = await aiosqlite.connect('cache.db')
    cache.row_factory = aiosqlite.Row

    await cache.execute('''
        CREATE TABLE IF NOT EXISTS cache (
            input TEXT,
            output TEXT,
            timestamp INTEGER DEFAULT (strftime('%s', 'now'))
        )
    ''')
    await cache.commit()


async def close(logger: Logger):
    global cache
    logger.debug('Closing connection to cache.db')
    await cache.close()

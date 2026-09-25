import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from src.core.config import settings
from src.core.logger import logger
from src.database.models import Base

DATABASE_URL = settings.database.url

# Create Async Engine
engine = create_async_engine(
    DATABASE_URL,
    echo=settings.database.echo,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def init_db():
    """Create database tables if they do not exist."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"Initialized database schema with URL: {DATABASE_URL}")
    except Exception as e:
        logger.warning(f"Database schema initialization notice: {e}")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency yielding an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

__all__ = ("router", )

from aiogram import Router
from .start import router as router_start

router = Router()
router.include_routers(router_start)

"""empty message

Revision ID: 989115366a37
Revises: d6f77b445901
Create Date: 2025-05-19 15:58:21.926502

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '989115366a37'
down_revision: Union[str, None] = 'd6f77b445901'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

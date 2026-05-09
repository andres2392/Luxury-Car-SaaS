"""add storage path to car images

Revision ID: 20260508_0004
Revises: 20260508_0003
Create Date: 2026-05-08 00:00:01.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260508_0004"
down_revision: str | None = "20260508_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("car_images", sa.Column("storage_path", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("car_images", "storage_path")

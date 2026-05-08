"""add inquiry state

Revision ID: 20260507_0003
Revises: 20260423_0002
Create Date: 2026-05-07 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "20260507_0003"
down_revision = "20260423_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "inquiries",
        sa.Column("state", sa.String(length=50), server_default="new", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("inquiries", "state")

"""add favorites table

Revision ID: 20260423_0002
Revises: 20260420_0001
Create Date: 2026-04-23 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "20260423_0002"
down_revision = "20260420_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "favorites",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("car_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["car_id"], ["cars.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "car_id", name="uq_favorites_user_id_car_id"),
    )
    op.create_index("ix_favorites_user_id", "favorites", ["user_id"], unique=False)
    op.create_index("ix_favorites_car_id", "favorites", ["car_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_favorites_car_id", table_name="favorites")
    op.drop_index("ix_favorites_user_id", table_name="favorites")
    op.drop_table("favorites")

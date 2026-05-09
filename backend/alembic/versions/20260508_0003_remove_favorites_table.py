"""remove favorites table

Revision ID: 20260508_0003
Revises: 20260507_0003
Create Date: 2026-05-08 00:00:00.000000
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260508_0003"
down_revision: str | None = "20260507_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_table("favorites")


def downgrade() -> None:
    op.execute(
        """
        CREATE TABLE favorites (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
            car_id INTEGER NOT NULL REFERENCES cars (id) ON DELETE CASCADE,
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            CONSTRAINT uq_favorites_user_id_car_id UNIQUE (user_id, car_id)
        )
        """
    )

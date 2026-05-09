"""allow general inquiries

Revision ID: 20260508_0005
Revises: 20260508_0004
Create Date: 2026-05-08 00:00:02.000000
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260508_0005"
down_revision: str | None = "20260508_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("inquiries", "car_id", nullable=True)


def downgrade() -> None:
    op.execute("DELETE FROM inquiries WHERE car_id IS NULL")
    op.alter_column("inquiries", "car_id", nullable=False)

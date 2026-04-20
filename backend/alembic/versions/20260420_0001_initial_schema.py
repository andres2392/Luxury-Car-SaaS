"""initial schema

Revision ID: 20260420_0001
Revises: None
Create Date: 2026-04-20 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260420_0001"
down_revision = None
branch_labels = None
depends_on = None

user_role_enum = sa.Enum("admin", "dealer", "customer", name="user_role")
user_role_column_enum = postgresql.ENUM(
    "admin",
    "dealer",
    "customer",
    name="user_role",
    create_type=False,
)


def upgrade() -> None:
    user_role_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "dealers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("contact_email", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_dealers_contact_email", "dealers", ["contact_email"], unique=False)
    op.create_index("ix_dealers_name", "dealers", ["name"], unique=False)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", user_role_column_enum, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_role", "users", ["role"], unique=False)

    op.create_table(
        "cars",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("brand", sa.String(length=100), nullable=False),
        sa.Column("model", sa.String(length=100), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("mileage", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("main_image_url", sa.String(length=500), nullable=True),
        sa.Column("dealer_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.CheckConstraint("year >= 1900", name="ck_cars_year_min"),
        sa.CheckConstraint("price >= 0", name="ck_cars_price_positive"),
        sa.CheckConstraint("mileage >= 0", name="ck_cars_mileage_positive"),
        sa.ForeignKeyConstraint(["dealer_id"], ["dealers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_cars_brand", "cars", ["brand"], unique=False)
    op.create_index("ix_cars_dealer_id", "cars", ["dealer_id"], unique=False)
    op.create_index("ix_cars_model", "cars", ["model"], unique=False)
    op.create_index("ix_cars_price", "cars", ["price"], unique=False)
    op.create_index("ix_cars_year", "cars", ["year"], unique=False)

    op.create_table(
        "car_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("car_id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["car_id"], ["cars.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_car_images_car_id", "car_images", ["car_id"], unique=False)

    op.create_table(
        "inquiries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("car_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["car_id"], ["cars.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_inquiries_car_id", "inquiries", ["car_id"], unique=False)
    op.create_index("ix_inquiries_email", "inquiries", ["email"], unique=False)
    op.create_index("ix_inquiries_user_id", "inquiries", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_inquiries_user_id", table_name="inquiries")
    op.drop_index("ix_inquiries_email", table_name="inquiries")
    op.drop_index("ix_inquiries_car_id", table_name="inquiries")
    op.drop_table("inquiries")

    op.drop_index("ix_car_images_car_id", table_name="car_images")
    op.drop_table("car_images")

    op.drop_index("ix_cars_year", table_name="cars")
    op.drop_index("ix_cars_price", table_name="cars")
    op.drop_index("ix_cars_model", table_name="cars")
    op.drop_index("ix_cars_dealer_id", table_name="cars")
    op.drop_index("ix_cars_brand", table_name="cars")
    op.drop_table("cars")

    op.drop_index("ix_users_role", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    op.drop_index("ix_dealers_name", table_name="dealers")
    op.drop_index("ix_dealers_contact_email", table_name="dealers")
    op.drop_table("dealers")

    user_role_enum.drop(op.get_bind(), checkfirst=True)

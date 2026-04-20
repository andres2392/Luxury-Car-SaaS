from __future__ import annotations

import sys
from pathlib import Path
from decimal import Decimal

from sqlalchemy import select

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal
from app.models import Car, CarImage, Dealer


def seed() -> None:
    session = SessionLocal()

    try:
        existing_dealer = session.scalar(select(Dealer.id).limit(1))
        if existing_dealer is not None:
            print("Seed skipped: data already exists.")
            return

        dealers = [
            Dealer(
                name="Aurelius Motor Gallery",
                description="Boutique luxury dealer focused on curated grand touring and flagship sedans.",
                contact_email="concierge@aureliusmotors.com",
            ),
            Dealer(
                name="Velour Prestige Automotive",
                description="High-touch dealer specializing in executive SUVs and performance luxury inventory.",
                contact_email="sales@velourprestige.com",
            ),
        ]
        session.add_all(dealers)
        session.flush()

        cars = [
            Car(
                title="2024 Rolls-Royce Ghost Black Badge",
                brand="Rolls-Royce",
                model="Ghost",
                year=2024,
                price=Decimal("429900.00"),
                mileage=1200,
                description="Hand-finished V12 sedan with bespoke interior detailing and rear lounge package.",
                main_image_url="https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                dealer_id=dealers[0].id,
            ),
            Car(
                title="2023 Bentley Continental GT Mulliner",
                brand="Bentley",
                model="Continental GT",
                year=2023,
                price=Decimal("287500.00"),
                mileage=5400,
                description="Grand tourer with Mulliner specification, rotating display, and handcrafted cabin.",
                main_image_url="https://images.unsplash.com/photo-1494976388531-d1058494cdd8",
                dealer_id=dealers[0].id,
            ),
            Car(
                title="2024 Mercedes-Maybach S 680",
                brand="Mercedes-Maybach",
                model="S 680",
                year=2024,
                price=Decimal("249990.00"),
                mileage=2100,
                description="Flagship chauffeur sedan with executive rear seating and premium Burmester audio.",
                main_image_url="https://images.unsplash.com/photo-1555215695-3004980ad54e",
                dealer_id=dealers[0].id,
            ),
            Car(
                title="2024 Range Rover SV",
                brand="Land Rover",
                model="Range Rover SV",
                year=2024,
                price=Decimal("224950.00"),
                mileage=1800,
                description="Ultra-luxury SUV with ceramic controls, massage seating, and serene long-wheelbase comfort.",
                main_image_url="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b",
                dealer_id=dealers[1].id,
            ),
            Car(
                title="2023 Porsche Panamera Turbo S",
                brand="Porsche",
                model="Panamera Turbo S",
                year=2023,
                price=Decimal("198750.00"),
                mileage=7600,
                description="Performance luxury fastback with adaptive air suspension and carbon ceramic brakes.",
                main_image_url="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
                dealer_id=dealers[1].id,
            ),
        ]
        session.add_all(cars)
        session.flush()

        images = [
            CarImage(car_id=cars[0].id, image_url="https://images.unsplash.com/photo-1544636331-e26879cd4d9b"),
            CarImage(car_id=cars[0].id, image_url="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7"),
            CarImage(car_id=cars[1].id, image_url="https://images.unsplash.com/photo-1502877338535-766e1452684a"),
            CarImage(car_id=cars[2].id, image_url="https://images.unsplash.com/photo-1525609004556-c46c7d6cf023"),
            CarImage(car_id=cars[3].id, image_url="https://images.unsplash.com/photo-1511919884226-fd3cad34687c"),
            CarImage(car_id=cars[4].id, image_url="https://images.unsplash.com/photo-1493238792000-8113da705763"),
        ]
        session.add_all(images)
        session.commit()
        print("Seed completed successfully.")
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed()

from __future__ import annotations

import sys
from decimal import Decimal
from pathlib import Path

from sqlalchemy import select

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal
from app.models import Car, CarImage, Dealer


PRIMARY_DEALER = {
    "name": "Aurelius Motor Gallery",
    "description": "Boutique luxury dealer focused on curated collector inventory, grand touring icons, and flagship performance sedans.",
    "contact_email": "concierge@aureliusmotors.com",
}

IMAGE_POOL = [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8",
    "https://images.unsplash.com/photo-1555215695-3004980ad54e",
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b",
]

LUXURY_CARS = [
    ("2024 Rolls-Royce Ghost Black Badge", "Rolls-Royce", "Ghost", 2024, "429900.00", 1200, "Hand-finished V12 sedan with bespoke interior detailing and rear lounge package."),
    ("2023 Bentley Continental GT Mulliner", "Bentley", "Continental GT", 2023, "287500.00", 5400, "Grand tourer with Mulliner specification, rotating display, and handcrafted cabin."),
    ("2024 Mercedes-Maybach S 680", "Mercedes-Maybach", "S 680", 2024, "249990.00", 2100, "Flagship chauffeur sedan with executive rear seating and premium Burmester audio."),
    ("2024 Range Rover SV", "Land Rover", "Range Rover SV", 2024, "224950.00", 1800, "Ultra-luxury SUV with serene long-wheelbase comfort and a hand-finished interior."),
    ("2023 Porsche Panamera Turbo S", "Porsche", "Panamera Turbo S", 2023, "198750.00", 7600, "Performance luxury fastback with adaptive air suspension and carbon ceramic brakes."),
    ("2022 Ferrari F8 Tributo", "Ferrari", "F8 Tributo", 2022, "389500.00", 8420, "Twin-turbo V8 supercar finished in Rosso Corsa with a Nero leather cockpit."),
    ("2021 Lamborghini Huracan EVO", "Lamborghini", "Huracan EVO", 2021, "329900.00", 6180, "Naturally aspirated V10 coupe in Verde Mantis with dramatic low-slung presence."),
    ("2020 McLaren 720S Spider", "McLaren", "720S Spider", 2020, "298500.00", 9300, "Carbon-tub open-air supercar with vivid performance delivery and lightweight precision."),
    ("2023 Porsche 911 Turbo S", "Porsche", "911 Turbo S", 2023, "264900.00", 4870, "All-weather flagship 911 with immense speed and everyday grand touring comfort."),
    ("2022 Rolls-Royce Ghost", "Rolls-Royce", "Ghost", 2022, "329900.00", 12200, "A quietly opulent V12 saloon with rear executive seating and polished restraint."),
    ("2021 Aston Martin DBS Superleggera", "Aston Martin", "DBS Superleggera", 2021, "276500.00", 7600, "Aston Martin grand tourer with muscular V12 power and elegant long-hood proportions."),
    ("2024 Bentley Flying Spur Speed", "Bentley", "Flying Spur", 2024, "312000.00", 1900, "Four-door Bentley flagship blending limousine comfort with deeply composed speed."),
    ("2022 Ferrari Roma", "Ferrari", "Roma", 2022, "247500.00", 6900, "Modern front-engined Ferrari coupe with understated surfacing and superb road manners."),
    ("2023 Aston Martin DB12", "Aston Martin", "DB12", 2023, "268900.00", 3500, "Contemporary British GT with a luxurious cabin and sharpened twin-turbo performance."),
    ("2024 Bentley Bentayga Azure", "Bentley", "Bentayga", 2024, "238500.00", 2400, "Bentley SUV focused on long-distance refinement, wellness seating, and effortless presence."),
    ("2022 McLaren GT", "McLaren", "GT", 2022, "214900.00", 8100, "Grand touring McLaren with exotic carbon architecture and added luggage practicality."),
    ("2021 Porsche 911 Targa 4 GTS", "Porsche", "911 Targa 4 GTS", 2021, "189500.00", 9600, "Iconic Targa silhouette paired with GTS performance and all-wheel-drive confidence."),
    ("2023 Lamborghini Urus Performante", "Lamborghini", "Urus", 2023, "309500.00", 5200, "Super-SUV with extroverted styling, rapid acceleration, and daily usability."),
    ("2024 Mercedes-Maybach GLS 600", "Mercedes-Maybach", "GLS 600", 2024, "214000.00", 2800, "High-luxury SUV with executive rear lounge seating and a signature two-tone presentation."),
    ("2022 Rolls-Royce Cullinan Black Badge", "Rolls-Royce", "Cullinan", 2022, "447500.00", 8800, "The most imposing ultra-luxury SUV in a darker, more assertive Black Badge expression."),
    ("2023 Bentley Continental GTC Speed", "Bentley", "Continental GTC", 2023, "298900.00", 4100, "Open-air Bentley grand tourer with W12 power and hand-stitched touring luxury."),
    ("2021 Ferrari SF90 Stradale", "Ferrari", "SF90 Stradale", 2021, "519000.00", 4300, "Plug-in hybrid Ferrari halo car pairing electrified thrust with flagship performance."),
    ("2024 Range Rover SV LWB", "Land Rover", "Range Rover SV", 2024, "229500.00", 1600, "Long-wheelbase Range Rover crafted for discreet chauffeured luxury."),
    ("2022 Aston Martin DBX707", "Aston Martin", "DBX707", 2022, "205500.00", 7300, "Performance-focused luxury SUV with a powerful V8 and striking British presence."),
    ("2023 Porsche Cayenne Turbo GT", "Porsche", "Cayenne Turbo GT", 2023, "198900.00", 5600, "Track-bred Porsche SUV with remarkable speed, composure, and daily comfort."),
    ("2021 Bentley Mulsanne Speed", "Bentley", "Mulsanne", 2021, "348500.00", 11200, "A final-era Bentley flagship limousine with immense road presence and handcrafted detail."),
    ("2022 Rolls-Royce Wraith", "Rolls-Royce", "Wraith", 2022, "317500.00", 6700, "V12 coupe with a dramatic fastback roofline and a deeply cocooning grand touring cabin."),
    ("2023 Ferrari 296 GTB", "Ferrari", "296 GTB", 2023, "359900.00", 3200, "Hybrid Ferrari berlinetta with compact proportions and exceptionally vivid handling."),
    ("2024 Aston Martin Vantage Roadster", "Aston Martin", "Vantage", 2024, "192500.00", 1400, "Open-top V8 sports car with elegant surfacing and immediate driver engagement."),
    ("2021 McLaren Artura", "McLaren", "Artura", 2021, "228900.00", 5900, "Hybrid McLaren supercar with razor-sharp responses and a refined new platform."),
]


def ensure_primary_dealer(session) -> Dealer:
    dealer = session.scalar(
        select(Dealer).where(Dealer.contact_email == PRIMARY_DEALER["contact_email"])
    )

    if dealer is None:
        dealer = Dealer(**PRIMARY_DEALER)
        session.add(dealer)
        session.flush()
    else:
        dealer.name = PRIMARY_DEALER["name"]
        dealer.description = PRIMARY_DEALER["description"]

    return dealer


def ensure_car_images(session, car: Car, index: int) -> None:
    if car.images:
        return

    main_image_url = IMAGE_POOL[index % len(IMAGE_POOL)]
    gallery_image_url = IMAGE_POOL[(index + 1) % len(IMAGE_POOL)]

    car.main_image_url = main_image_url
    session.add(CarImage(car_id=car.id, image_url=gallery_image_url))


def seed() -> None:
    session = SessionLocal()

    try:
        dealer = ensure_primary_dealer(session)

        for car in session.scalars(select(Car)).all():
            car.dealer_id = dealer.id

        existing_cars = {
            car.title: car
            for car in session.scalars(select(Car).where(Car.dealer_id == dealer.id)).all()
        }

        created_count = 0

        for index, car_data in enumerate(LUXURY_CARS):
            title, brand, model, year, price, mileage, description = car_data
            car = existing_cars.get(title)

            if car is None:
                car = Car(
                    title=title,
                    brand=brand,
                    model=model,
                    year=year,
                    price=Decimal(price),
                    mileage=mileage,
                    description=description,
                    main_image_url=IMAGE_POOL[index % len(IMAGE_POOL)],
                    dealer_id=dealer.id,
                )
                session.add(car)
                session.flush()
                existing_cars[title] = car
                created_count += 1
            else:
                car.brand = brand
                car.model = model
                car.year = year
                car.price = Decimal(price)
                car.mileage = mileage
                car.description = description
                car.dealer_id = dealer.id
                if not car.main_image_url:
                    car.main_image_url = IMAGE_POOL[index % len(IMAGE_POOL)]

            ensure_car_images(session, car, index)

        session.commit()
        print(
            f"Seed completed successfully. Dealer normalized to '{dealer.name}' and {created_count} new cars added."
        )
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed()

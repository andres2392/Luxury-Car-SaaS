from __future__ import annotations

import json
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

MANIFEST_PATH = Path(__file__).resolve().with_name("template_image_manifest.json")
IMAGE_SEQUENCE = [
    "bentley-black",
    "bentley-old",
    "ferrari-testarosa",
    "mustang-67-black",
    "mustang67",
    "porsche-old",
    "collector-analog-detail",
    "collector-analog-icons-garage",
    "collector-carrera-gt-gallery",
    "collector-heritage-defender-gallery",
    "collector-sell-consign-lounge",
    "homepage-custom-hero-mustang",
    "gallery-detail-atelier",
    "gallery-hotel-arrival",
    "gallery-mountain-coupe",
    "gallery-private-showroom",
    "mountain-coupe-user",
    "detail-atelier-user",
    "private-showroom-user",
    "hotel-arrival-user",
]

LUXURY_CARS = [
    ("1994 Ferrari 512 TR", "Ferrari", "512 TR", 1994, "389500.00", 8420, "Presented in Rosso Corsa over Nero leather, this 512 TR captures the analog Ferrari theatre collectors still chase: gated tactility, wide-body presence, and a beautifully preserved cabin."),
    ("1989 Porsche 930 Turbo Slant Nose", "Porsche", "930 Turbo Slant Nose", 1989, "315000.00", 21300, "Collector-grade air-cooled Turbo specification with period-correct Slant Nose drama, documented low mileage, and the unmistakable mechanical edge of Stuttgart's forced-induction era."),
    ("2005 Porsche Carrera GT", "Porsche", "Carrera GT", 2005, "1275000.00", 6180, "GT Silver over Ascot Brown with the manual V10 character that defines modern collectible Porsche engineering, presented as an investment-grade analogue supercar."),
    ("2001 Ferrari 550 Maranello", "Ferrari", "550 Maranello", 2001, "279000.00", 14900, "A front-engine V12 grand tourer in elegant collector specification, balancing long-distance civility with the last great era of understated Ferrari proportion."),
    ("2003 Aston Martin Vanquish", "Aston Martin", "Vanquish", 2003, "142500.00", 18200, "Hand-built Newport Pagnell-era Vanquish with muscular surfacing, rich British GT character, and the cinematic presence of an early modern Aston icon."),
    ("1993 Land Rover Defender 110 Heritage", "Land Rover", "Defender 110", 1993, "168000.00", 31400, "Restored heritage Defender with purposeful stance, saddle leather details, and the quiet confidence of a collector utility vehicle built for estate and city alike."),
    ("1991 Lamborghini Diablo", "Lamborghini", "Diablo", 1991, "412000.00", 11900, "Early Diablo specification with wedge-era proportions, naturally aspirated V12 theatre, and the raw visual energy that made Sant'Agata posters permanent garage art."),
    ("1997 Ferrari F355 Berlinetta", "Ferrari", "F355 Berlinetta", 1997, "246500.00", 17400, "A beautifully balanced mid-engine Ferrari with gated-manual desirability, compact analog proportions, and a specification selected for long-term collector relevance."),
    ("1995 Porsche 911 Carrera 2 Coupe", "Porsche", "911 Carrera 2", 1995, "189900.00", 28600, "Air-cooled 993 Carrera 2 coupe with restrained color, manual gearbox appeal, and the final evolution of the classic 911 silhouette."),
    ("2004 Ferrari 360 Challenge Stradale", "Ferrari", "360 Challenge Stradale", 2004, "349500.00", 9600, "Lightweight Ferrari road racer with focused cabin, carbon details, and a naturally aspirated soundtrack that remains one of Maranello's great modern signatures."),
    ("2012 Lexus LFA", "Lexus", "LFA", 2012, "925000.00", 5400, "An obsessive engineering landmark with carbon construction and a V10 note closer to motorsport instrumentation than conventional grand touring."),
    ("2006 Ford GT Heritage", "Ford", "GT Heritage", 2006, "589000.00", 7200, "Heritage-liveried American supercar with Le Mans lineage, supercharged V8 character, and a collector following built on rarity and occasion."),
    ("2011 Mercedes-Benz SLS AMG", "Mercedes-AMG", "SLS AMG", 2011, "267500.00", 13800, "Gullwing AMG coupe with naturally aspirated 6.2-liter charisma, long-hood theatre, and a cabin that feels equal parts grand tourer and modern icon."),
    ("2021 Mercedes-AMG GT Black Series", "Mercedes-AMG", "GT Black Series", 2021, "448000.00", 2400, "Track-honed Black Series specification with low documented mileage, exposed aerodynamic purpose, and the finality of AMG's wildest front-engine statement."),
    ("2016 McLaren 675LT Spider", "McLaren", "675LT Spider", 2016, "315000.00", 6900, "Longtail Spider with carbon-tub precision, limited-production desirability, and the rare balance of open-air theatre and serious circuit intent."),
    ("2020 McLaren Speedtail", "McLaren", "Speedtail", 2020, "2450000.00", 1200, "Hyper-GT rarity with central driving position, sculptural speed-form bodywork, and a collection-grade sense of futurism."),
    ("2019 Aston Martin DBS Superleggera", "Aston Martin", "DBS Superleggera", 2019, "276500.00", 7600, "DBS Superleggera presented as a modern British flagship GT: muscular V12 delivery, tailored interior atmosphere, and restrained collector elegance."),
    ("2023 Aston Martin DB12 Coupe", "Aston Martin", "DB12", 2023, "268900.00", 3500, "Current-generation Aston Martin grand tourer with sharpened chassis manners, deeply appointed cabin materials, and a confident modern collector specification."),
    ("2023 Bentley Continental GT Mulliner", "Bentley", "Continental GT", 2023, "287500.00", 5400, "Mulliner-appointed Continental GT with handcrafted cabin detail, grand touring composure, and the quiet authority expected of Crewe's finest coupe."),
    ("2024 Bentley Flying Spur Speed", "Bentley", "Flying Spur", 2024, "312000.00", 1900, "Four-door Bentley flagship with Speed specification, hand-finished appointments, and effortless long-distance performance for a private collection."),
    ("2021 Bentley Mulsanne Speed", "Bentley", "Mulsanne", 2021, "348500.00", 11200, "Final-era Mulsanne Speed with imposing road presence, deep leather craftsmanship, and the dignified rarity of Bentley's flagship limousine."),
    ("2022 Rolls-Royce Wraith Black Badge", "Rolls-Royce", "Wraith", 2022, "317500.00", 6700, "Black Badge Wraith with fastback drama, V12 ease, and a cabin designed around silence, scale, and private arrival."),
    ("2024 Rolls-Royce Ghost Black Badge", "Rolls-Royce", "Ghost", 2024, "429900.00", 1200, "Low-mile Ghost Black Badge with bespoke finishing, darker visual presence, and the effortless authority of a contemporary collector saloon."),
    ("2022 Rolls-Royce Cullinan Black Badge", "Rolls-Royce", "Cullinan", 2022, "447500.00", 8800, "Cullinan Black Badge with commanding proportions, rear lounge refinement, and a specification tailored for discreet high-luxury movement."),
    ("2018 Porsche 911 GT2 RS Weissach", "Porsche", "911 GT2 RS", 2018, "419000.00", 3900, "Weissach-equipped GT2 RS with low mileage, motorsport-derived weight discipline, and the ferocity that defines Porsche's modern rear-drive halo cars."),
    ("2016 Porsche 911 R", "Porsche", "911 R", 2016, "525000.00", 5100, "Manual 911 R with lightweight intent, restrained presentation, and the kind of analogue engagement that turns specification into provenance."),
    ("2014 Ferrari F12berlinetta", "Ferrari", "F12berlinetta", 2014, "329000.00", 10400, "Naturally aspirated V12 Ferrari in elegant grand touring configuration, offering speed, sound, and sculpture in equal measure."),
    ("2021 Ferrari SF90 Stradale", "Ferrari", "SF90 Stradale", 2021, "519000.00", 4300, "Ferrari's electrified halo berlinetta with dramatic acceleration, layered chassis technology, and a specification fit for a forward-looking collection."),
    ("2020 Lamborghini Aventador SVJ Roadster", "Lamborghini", "Aventador SVJ", 2020, "689000.00", 3600, "Open-air SVJ with naturally aspirated V12 spectacle, active aero aggression, and the final-era Aventador intensity collectors seek."),
    ("2019 Bugatti Chiron Sport", "Bugatti", "Chiron Sport", 2019, "3650000.00", 1800, "Chiron Sport with extraordinary mileage discipline, hypercar craftsmanship, and the architectural speed presence expected from Molsheim."),
]


def load_image_manifest() -> dict[str, dict[str, str]]:
    if not MANIFEST_PATH.exists():
        raise RuntimeError(
            "Template image manifest is missing. Run backend/scripts/upload_template_images.py first."
        )

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    missing = [key for key in IMAGE_SEQUENCE if key not in manifest]
    if missing:
        raise RuntimeError(
            "Template image manifest is incomplete. Missing keys: "
            + ", ".join(missing)
        )

    return manifest


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


def gallery_images_for_index(index: int, image_pool: list[dict[str, str]]) -> list[dict[str, str]]:
    gallery_count = 3 + (index % 5)
    return [
        image_pool[(index + offset + 1) % len(image_pool)]
        for offset in range(gallery_count)
    ]


def create_car_images(session, car: Car, index: int, image_pool: list[dict[str, str]]) -> None:
    car.main_image_url = image_pool[index % len(image_pool)]["url"]

    for gallery_image in gallery_images_for_index(index, image_pool):
        session.add(
            CarImage(
                car_id=car.id,
                image_url=gallery_image["url"],
                storage_path=gallery_image["storage_path"],
            )
        )


def clear_existing_inventory(session) -> int:
    cars = session.scalars(select(Car)).all()
    deleted_count = len(cars)

    for car in cars:
        session.delete(car)

    session.flush()
    return deleted_count


def seed() -> None:
    session = SessionLocal()

    try:
        dealer = ensure_primary_dealer(session)
        manifest = load_image_manifest()
        image_pool = [manifest[key] for key in IMAGE_SEQUENCE]

        deleted_count = clear_existing_inventory(session)

        for index, car_data in enumerate(LUXURY_CARS):
            title, brand, model, year, price, mileage, description = car_data
            car = Car(
                title=title,
                brand=brand,
                model=model,
                year=year,
                price=Decimal(price),
                mileage=mileage,
                description=description,
                main_image_url=image_pool[index % len(image_pool)]["url"],
                dealer_id=dealer.id,
            )
            session.add(car)
            session.flush()
            create_car_images(session, car, index, image_pool)

        session.commit()
        print(
            f"Seed completed successfully. Deleted {deleted_count} cars and created {len(LUXURY_CARS)} collector vehicles for '{dealer.name}'."
        )
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed()

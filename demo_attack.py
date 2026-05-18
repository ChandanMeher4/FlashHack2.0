#!/usr/bin/env python3
"""
Concurrent registration demo against the FlashHack Spring Boot backend.

Spawns 50 threads against a 10-seat course to demonstrate:
  1. /api/registration/unsafe/{courseId} — race condition / overselling
  2. /api/registration/safe/{courseId}   — synchronized, correct seat count
"""

from __future__ import annotations

import sys
import threading
from dataclasses import dataclass

import requests

BASE_URL = "http://localhost:8080"
COURSE_ID = "CS101"
INITIAL_SEATS = 10
THREAD_COUNT = 50


@dataclass
class AttackStats:
    registered: int = 0
    rejected: int = 0
    errors: int = 0


def get_seat_count(session: requests.Session) -> int:
    response = session.get(f"{BASE_URL}/api/registration/seats/{COURSE_ID}", timeout=10)
    response.raise_for_status()
    return int(response.text)


def reset_seats(session: requests.Session) -> int:
    response = session.post(f"{BASE_URL}/api/registration/reset/{COURSE_ID}", timeout=10)
    response.raise_for_status()
    return int(response.text)


def run_concurrent_attack(session: requests.Session, endpoint: str, stats: AttackStats, barrier: threading.Barrier) -> None:
    lock = threading.Lock()

    def worker() -> None:
        try:
            barrier.wait()
            response = session.post(f"{BASE_URL}{endpoint}/{COURSE_ID}", timeout=30)
            response.raise_for_status()
            result = response.json()
            with lock:
                if result.get("registered"):
                    stats.registered += 1
                else:
                    stats.rejected += 1
        except Exception:
            with lock:
                stats.errors += 1

    threads = [threading.Thread(target=worker) for _ in range(THREAD_COUNT)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()


def print_phase_header(title: str) -> None:
    print()
    print("=" * 60)
    print(title)
    print("=" * 60)


def main() -> int:
    session = requests.Session()

    try:
        session.get(f"{BASE_URL}/api/curriculum/sorted", timeout=5)
    except requests.RequestException as error:
        print(f"Cannot reach backend at {BASE_URL}. Start Spring Boot first.", file=sys.stderr)
        print(f"  ({error})", file=sys.stderr)
        return 1

    reset_seats(session)
    starting_seats = get_seat_count(session)
    print(f"Target course: {COURSE_ID} ({starting_seats} seats, {THREAD_COUNT} concurrent threads)")

    # --- Phase 1: unsafe (race condition) ---
    print_phase_header("PHASE 1: UNSAFE — /api/registration/unsafe")
    unsafe_stats = AttackStats()
    unsafe_barrier = threading.Barrier(THREAD_COUNT)
    run_concurrent_attack(
        session,
        "/api/registration/unsafe",
        unsafe_stats,
        unsafe_barrier,
    )

    final_unsafe_seats = get_seat_count(session)
    print(f"  Successful registrations (reported): {unsafe_stats.registered}")
    print(f"  Rejected attempts:                   {unsafe_stats.rejected}")
    print(f"  Request errors:                      {unsafe_stats.errors}")
    print(f"  Final seat count on server:          {final_unsafe_seats}")
    print()
    if unsafe_stats.registered > INITIAL_SEATS or final_unsafe_seats != max(0, INITIAL_SEATS - unsafe_stats.registered):
        print("  >> DATA CORRUPTION: more than 10 students registered, or seat count does not match reality.")
    else:
        print("  >> Race may be inconclusive this run; retry or ensure the server is not under heavy load.")

    # --- Reset for fair safe comparison ---
    print()
    print(f"Resetting {COURSE_ID} back to {INITIAL_SEATS} seats before safe phase...")
    reset_seats(session)

    # --- Phase 2: safe (synchronized) ---
    print_phase_header("PHASE 2: SAFE — /api/registration/safe")
    safe_stats = AttackStats()
    safe_barrier = threading.Barrier(THREAD_COUNT)
    run_concurrent_attack(
        session,
        "/api/registration/safe",
        safe_stats,
        safe_barrier,
    )

    final_safe_seats = get_seat_count(session)
    print(f"  Successful registrations (reported): {safe_stats.registered}")
    print(f"  Rejected attempts:                   {safe_stats.rejected}")
    print(f"  Request errors:                      {safe_stats.errors}")
    print(f"  Final seat count on server:          {final_safe_seats}")
    print()
    if safe_stats.registered == INITIAL_SEATS and final_safe_seats == 0:
        print("  >> SYNCHRONIZED LOCK HELD: exactly 10 registrations, 0 seats remaining.")
    else:
        print("  >> Unexpected safe-phase outcome; expected 10 successes and 0 seats left.")

    print()
    print("=" * 60)
    print("SUMMARY")
    print(f"  Unsafe final seats: {final_unsafe_seats}  (expected corruption vs 10-seat cap)")
    print(f"  Safe final seats:   {final_safe_seats}  (expected 0)")
    print("=" * 60)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

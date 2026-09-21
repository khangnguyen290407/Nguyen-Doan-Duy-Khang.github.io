---
title: "Swift practice: modeling a digital crop"
date: "2026-06-27"
summary: "Notes from practicing Swift models, farm-day simulation, and MVVM-style thinking for an agricultural twin idea."
tags: ["Swift", "iOS", "CS Fundamentals"]
---

Today I practiced the domain model for a digital agricultural twin. The goal was not to build the full iOS app yet, but to make the logic clear enough that a SwiftUI screen can use it later.

## What I modeled

- A crop template with expected harvest days.
- A digital crop with water, fertilizer, age, and stage.
- Farm actions such as planting, watering, fertilizing, advancing time, and harvesting.
- A simple ledger entry after each important action.

## Takeaway

Before building screens, I should understand the state transitions. A clean model makes the future UI easier to reason about.

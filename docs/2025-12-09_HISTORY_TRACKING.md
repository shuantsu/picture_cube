# History Tracking

## Overview

The history tracking feature allows you to record and navigate through your cube solving process, including support for exploring alternative solution branches.

## Usage

### Enabling/Disabling Tracking

- **ON**: Shows "✓ Track History (ON)" in green - all moves are recorded
- **OFF**: Shows "Track History (OFF)" in gray - moves are not recorded

### Important Behavior

When you disable tracking, perform moves, and then re-enable it:
- A "TRACK: ON" marker is added to the history
- Moves performed while tracking was OFF are **not recorded**
- Navigating between states before and after the gap will "jump" over untracked moves
- This is expected behavior - only tracked moves can be replayed

### Best Practices

- Keep tracking enabled throughout your solving session for complete history
- If you need to experiment without recording, disable tracking temporarily
- Use "Clear History" to start fresh if needed

## Future Improvements

- Better handling of tracking gaps
- Option to merge untracked moves into history
- Visual indicators for tracking gaps in the graph

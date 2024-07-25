from enum import Enum

# Enum for the frequency
# Note this is defined in the interface in collection-plan.ts
# as ScheduleFrequency
class ScheduleFrequency(Enum):
  HOURLY = "Hourly"
  DAILY = "Daily"
  WEEKLY = "Weekly"
  MONTHLY = "Monthly"

  @staticmethod
  def from_str(label):
    if label == "Hourly":
      return ScheduleFrequency.HOURLY
    elif label == "Daily":
      return ScheduleFrequency.DAILY
    elif label == "Weekly":
      return ScheduleFrequency.WEEKLY
    elif label == "Monthly":
      return ScheduleFrequency.MONTHLY
    else:
      raise ValueError("Invalid frequency label ", label)

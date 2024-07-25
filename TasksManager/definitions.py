from enum import Enum

# Enum for the frequency
class TaskStatus(Enum):
  ACTIVE = "active"
  DONE = "done"
  ERROR = "error"
  CANCELLED = "cancelled"

  @staticmethod
  def from_str(label):
    if label == "active":
      return TaskStatus.ACTIVE
    elif label == "done":
      return TaskStatus.DONE
    elif label == "error":
      return TaskStatus.ERROR
    elif label == "cancelled":
      return TaskStatus.CANCELLED
    else:
      raise ValueError("Invalid status label ", label)
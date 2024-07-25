from enum import Enum


class ContentLabel(Enum):
  DISINFORMATION = "DISINFORMATION"
  MITIGATOR = "MITIGATOR"
  NEUTRAL = "NEUTRAL"
  NOT_APPLICABLE = "N/A"
  ERROR = "ERROR"

  @staticmethod
  def from_str(label):
    label = label.upper()
    if label == "DISINFORMATION":
      return ContentLabel.DISINFORMATION
    elif label == "MITIGATOR":
      return ContentLabel.MITIGATOR
    elif label == "NEUTRAL":
      return ContentLabel.NEUTRAL
    elif label == "N/A":
      return ContentLabel.NOT_APPLICABLE
    elif label == "ERROR":
      return ContentLabel.ERROR
    else:
      # approximate matching due to chatpgt not always responding with
      # the exact label
      if "DISIN" in label:
        return ContentLabel.DISINFORMATION
      elif "MITIG" in label:
        return ContentLabel.MITIGATOR
      elif "NEUT" in label:
        return ContentLabel.NEUTRAL
      elif "N/A" in label:
        return ContentLabel.NOT_APPLICABLE
      else:
        raise ValueError("Invalid label", label)

import random
from enum import Enum
from ContentLabeler.label import ContentLabel

class Labeler:

  def __init__(self, disinformer_narrative, mitigator_narrative, neutral_narrative, config):
    if not disinformer_narrative:
      raise ValueError("Disinformer narrative is required")
    if not mitigator_narrative:
      raise ValueError("Mitigator narrative is required")
    if not neutral_narrative:
      raise ValueError("Neutral narrative is required")

    self.disinformer_narrative = disinformer_narrative
    self.mitigator_narrative = mitigator_narrative
    self.neutral_narrative = neutral_narrative

    self.config = config

  def label(self, content):
    """
    Label the content of a URL. By default is random, but this method will be overriden by the specific labeler
    """
    return random.choice([
      ContentLabel.DISINFORMATION,
      ContentLabel.MITIGATOR,
      ContentLabel.NEUTRAL,
      ContentLabel.NOT_APPLICABLE
    ])

  def build_prompt(self, content):
    """
    Build the prompt
    """
    if not content:
      raise Exception("Content is required")

    prompt = f"Label the page as DISINFORMATION if:\n{self.disinformer_narrative}\n\n"
    prompt += f"Label the page as MITIGATOR if:\n{self.mitigator_narrative}\n\n"
    prompt += f"Label the page as NEUTRAL if:\n{self.neutral_narrative}\n\n"
    prompt += f"I am going to give the content of an article from the Web and you label it as DISINFORMATION, MITIGATOR, or NEUTRAL. Provide only the label with no further explanations.\n"
    prompt += f"Here is the content:\n\n---\n\n {content}\n\n---"

    return prompt
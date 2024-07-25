from .labeler import * 
from .chatgpt_labeler import *

def get_labeler(disinformer_narrative, mitigator_narrative, neutral_narrative, config):
  labeler_type = config["content_labeler"]["labeler"]
  if labeler_type == "chat_gpt":
    return ChatGPTLabeler(disinformer_narrative, mitigator_narrative, neutral_narrative, config)
  else:
    raise ValueError("Invalid labeler type ", labeler_type)
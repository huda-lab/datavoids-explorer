from ContentLabeler.labelers.labeler import Labeler
from openai import OpenAI
import tiktoken
import time


class ChatGPTLabeler(Labeler):

  def __init__(self, disinformer_narrative, mitigator_narrative, neutral_narrative, config):
    super().__init__(disinformer_narrative, mitigator_narrative, neutral_narrative, config)
    self.set_role()

  def set_role(self, role=None):
    """
    Set the role of the ChatGPT assistant.
    """
    self.role = {
      "role": "system",
      "content": "You are a intelligent assistant that specializes"
        + " in labeling possible misinformation articles."}
    if role:
      self.role = role

  def label(self, content):
    """
    Label the content of a URL.
    """
    model: str = self.config["APIs"]["open_ai"]["model"]
    prompt = self.build_prompt(content)
    messages = [self.role, {"role": "user", "content": prompt}]

    # get the number of tokens
    num_tokens = self.num_tokens_from_messages(messages)
    if num_tokens - 4096 > 0:
      # remove the last chunk of the message
      messages[-1]["content"] = self.reduce_string_size(messages[-1]["content"])
      # get the number of tokens again
      num_tokens = self.num_tokens_from_messages(messages)

    # call llm
    completion = None
    while not completion:
      try:
        open_ai_client = OpenAI(
          api_key=self.config["APIs"]["open_ai"]["key"]
        )
        completion = open_ai_client.chat.completions.create(model=model, messages=messages)
      except Exception as e:
        print("Exception:", e)

    return completion.choices[0].message.content


  def num_tokens_from_messages(self, messages):
    """
    Returns the number of tokens used by a list of messages.
    """
    model: str = self.config["APIs"]["open_ai"]["model"]
    try:
      encoding = tiktoken.encoding_for_model(model)
    except KeyError:
      encoding = tiktoken.get_encoding("cl100k_base")

    if model.startswith("gpt-3.5-turbo"):
      num_tokens = 0
      for message in messages:
        # every message follows <im_start>{role/name}\n{content}<im_end>\n
        num_tokens += 4
        for key, value in message.items():
          num_tokens += len(encoding.encode(value))
          if key == "name":  # if there's a name, the role is omitted
            num_tokens += -1  # role is always required and always 1 token
      num_tokens += 2  # every reply is primed with <im_start>assistant
      return num_tokens
    else:
      raise NotImplementedError("Number of tokens estimator is not present for the" +
                                f"model {model}.")


  def reduce_string_size(self, text):
    """
    Reduces the size of a string to a target number of tokens.
    """
    target_tokens: int = self.config["APIs"]["open_ai"]["target_tokens"]

    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)

    if len(tokens) <= target_tokens:
      return text

    reduced_tokens = tokens[:target_tokens]
    reduced_text = encoding.decode(reduced_tokens)

    return reduced_text

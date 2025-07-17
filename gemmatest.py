from gemma import gm

# Model and parameters
model = gm.nn.Gemma3_4B()
params = gm.ckpts.load_params(gm.ckpts.CheckpointPath.GEMMA3_4B_IT)

# Example of multi-turn conversation
sampler = gm.text.ChatSampler(
    model=model,
    params=params,
    multi_turn=True,
)

prompt = """does an apple or a banana have more calories?"""
# out0 = sampler.chat(prompt, images=[image1, image2])

out0 = sampler.chat(prompt)

# out1 = sampler.chat('What about the other image ?')
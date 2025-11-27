# Map the face keys (for the JSON) to their respective colors (hex codes)
face_colors = {
    "U": "#ffffff", # White
    "L": "#ff5800", # Orange
    "F": "#009b48", # Green
    "R": "#c41e3a", # Red
    "B": "#0045ad", # Blue
    "D": "#ffd500", # Yellow
}

# Create the formatted backgrounds using the base string
bg_base = "radial-gradient({color} 90%, black 95%)"
backgrounds = {face: bg_base.format(color=color) for face, color in face_colors.items()}

# Use an f-string (multiline text) to build the JSON, embedding the backgrounds directly
json_texture_faces = f"""
{{
  "mode": "face_textures",
  "textures": {{
    "U": {{"background": "{backgrounds["U"]}"}},
    "L": {{"background": "{backgrounds["L"]}"}},
    "F": {{"background": "{backgrounds["F"]}"}},
    "R": {{"background": "{backgrounds["R"]}"}},
    "B": {{"background": "{backgrounds["B"]}"}},
    "D": {{"background": "{backgrounds["D"]}"}},
    "U_center": {{
      "background": "url('https://filipeteixeira.com.br/rubiksim/moyulogo.svg'), {backgrounds["U"]}",
      "backgroundSize": "100%",
      "backgroundRepeat": "no-repeat",
      "backgroundPosition": "center"
    }}
  }}
}}
"""

print(json_texture_faces)
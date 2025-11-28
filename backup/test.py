
SIZE = 150

def makeSide(F,U,R,D,L,n=50):
      return f"""<div style='width:{SIZE}px;height:{SIZE}px;background:linear-gradient({F}, {F}) center / {n}% {n}% no-repeat,
      conic-gradient(from 45deg at 50% 50%,
          {R} 0deg,
          {R} 90deg,     
          {D} 90deg,
          {D} 180deg,    
          {L} 180deg,
          {L} 270deg,    
          {U} 270deg,
          {U} 360deg
        ) center / 100% 100% no-repeat;'></div><br/>
      """

face_colors = {
    "U": "#ffffff", # White
    "L": "#ff5800", # Orange
    "F": "#009b48", # Green
    "R": "#c41e3a", # Red
    "B": "#0045ad", # Blue
    "D": "#ffd500", # Yellow
}

W = face_colors["U"]
O = face_colors["L"]
G = face_colors["F"]
R = face_colors["R"]
B = face_colors["B"]
Y = face_colors["D"]

n = 66

FU = makeSide(W,B,R,G,O,n)
FL = makeSide(O,W,G,Y,B,n)
FF = makeSide(G,W,R,Y,O,n)
FR = makeSide(R,W,B,Y,G,n)
FB = makeSide(B,W,O,Y,R,n)
FD = makeSide(Y,G,R,B,O,n)

print(F'''
<table>
      <tr><td></td><td>{FU}</td><td colspan=2></td></tr>
      <tr><td>{FL}</td><td>{FF}</td><td>{FR}</td><td>{FB}</td></tr>
      <tr><td></td><td>{FD}</td><td colspan=2></td></tr>
    </table>
''')
from PIL import Image, ImageDraw

# Crear imagen del personaje pixelado
width, height = 512, 512
img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)

# Colores según la imagen proporcionada
colors = {
    'pink_light': (255, 179, 217),
    'pink_medium': (255, 153, 204),
    'pink_dark': (219, 112, 147),
    'blue_dark': (26, 55, 144),
    'blue_medium': (70, 130, 255),
    'blue_light': (173, 216, 230),
    'gold': (255, 215, 0),
    'gold_dark': (218, 165, 32),
    'white': (255, 255, 255),
    'black': (0, 0, 0),
    'gray_dark': (64, 64, 64),
    'red': (255, 0, 0),
    'red_dark': (139, 0, 0),
}

# Cabeza/Cuerpo principal (rosado)
draw.rectangle([80, 60, 432, 360], fill=colors['pink_light'])

# Ojos izquierdo - azul oscuro
draw.rectangle([140, 130, 180, 180], fill=colors['blue_dark'])
# Brillo ojo izquierdo
draw.rectangle([150, 145, 165, 160], fill=colors['white'])

# Ojos derecho - azul oscuro
draw.rectangle([332, 130, 372, 180], fill=colors['blue_dark'])
# Brillo ojo derecho
draw.rectangle([342, 145, 357, 160], fill=colors['white'])

# Accesorios de cabello superior izquierdo (azul y oro)
for i in range(80, 140, 16):
    draw.rectangle([i, 20, i+16, 60], fill=colors['blue_dark'])
    draw.rectangle([i+8, 30, i+24, 70], fill=colors['gold'])

# Accesorios de cabello superior derecho (azul y oro)
for i in range(372, 432, 16):
    draw.rectangle([i, 20, i+16, 60], fill=colors['gold'])
    draw.rectangle([i-8, 30, i+8, 70], fill=colors['blue_dark'])

# Laterales oscuros/grises (textura del cabello)
for x in range(60, 80, 8):
    for y in range(100, 280, 8):
        if (x + y) % 16 == 0:
            draw.rectangle([x, y, x+8, y+8], fill=colors['gray_dark'])
            
for x in range(432, 452, 8):
    for y in range(100, 280, 8):
        if (x + y) % 16 == 0:
            draw.rectangle([x, y, x+8, y+8], fill=colors['gray_dark'])

# Mejillas/detalles rojos
draw.rectangle([110, 220, 130, 245], fill=colors['red_dark'])
draw.rectangle([382, 220, 402, 245], fill=colors['red_dark'])

# Boca/nariz
draw.rectangle([236, 280, 276, 300], fill=colors['red_dark'])

# Pies rojos grandes (izquierdo)
draw.rectangle([120, 360, 200, 450], fill=colors['red'])

# Pies rojos grandes (derecho)
draw.rectangle([312, 360, 392, 450], fill=colors['red'])

# Guardar como PNG y luego convertir a GIF
img.save('mascota_temp.png')

# Crear GIF animado (2 frames para animación)
frames = [img]
img2 = Image.new('RGBA', (width, height), (255, 255, 255, 0))
draw2 = ImageDraw.Draw(img2)

# Frame 2 con pequeña variación (parpadeo)
draw2.rectangle([80, 60, 432, 360], fill=colors['pink_light'])
draw2.rectangle([140, 128, 180, 182], fill=colors['blue_dark'])
draw2.rectangle([150, 143, 165, 162], fill=colors['white'])
draw2.rectangle([332, 128, 372, 182], fill=colors['blue_dark'])
draw2.rectangle([342, 143, 357, 162], fill=colors['white'])

for i in range(80, 140, 16):
    draw2.rectangle([i, 20, i+16, 60], fill=colors['blue_dark'])
    draw2.rectangle([i+8, 30, i+24, 70], fill=colors['gold'])

for i in range(372, 432, 16):
    draw2.rectangle([i, 20, i+16, 60], fill=colors['gold'])
    draw2.rectangle([i-8, 30, i+8, 70], fill=colors['blue_dark'])

draw2.rectangle([110, 220, 130, 245], fill=colors['red_dark'])
draw2.rectangle([382, 220, 402, 245], fill=colors['red_dark'])
draw2.rectangle([236, 280, 276, 300], fill=colors['red_dark'])
draw2.rectangle([120, 360, 200, 450], fill=colors['red'])
draw2.rectangle([312, 360, 392, 450], fill=colors['red'])

frames.append(img2)

# Guardar como GIF
frames[0].save(
    'mascota.gif',
    save_all=True,
    append_images=frames[1:],
    duration=600,
    loop=0,
    optimize=False
)

print("GIF mascota.gif creado exitosamente")

#!/usr/bin/env python3
"""
Script per generare le icone PWA dalle SVG
Richiede: pip install pillow cairosvg
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import io
    
    def create_icon(size, output_path):
        """Crea un'icona con termometro"""
        # Crea immagine con gradiente
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Sfondo con gradiente (simulato con cerchi concentrici)
        for i in range(size):
            progress = i / size
            r = int(102 + (118 - 102) * progress)
            g = int(126 + (75 - 126) * progress)
            b = int(234 + (162 - 234) * progress)
            color = (r, g, b, 255)
            
            # Rettangolo con angoli arrotondati
            if i == 0:
                radius = size // 5
                draw.rounded_rectangle([i, i, size-i-1, size-i-1], radius=radius, fill=color)
        
        # Dimensioni relative alla size
        center_x = size // 2
        center_y = size // 2
        
        # Scala per il termometro
        scale = size / 100
        
        # Disegna il termometro
        # Corpo del termometro (rettangolo bianco)
        thermo_width = int(16 * scale)
        thermo_height = int(35 * scale)
        thermo_x1 = center_x - thermo_width // 2
        thermo_y1 = center_y - int(25 * scale)
        thermo_x2 = center_x + thermo_width // 2
        thermo_y2 = center_y + int(10 * scale)
        
        draw.rounded_rectangle(
            [thermo_x1, thermo_y1, thermo_x2, thermo_y2],
            radius=int(8 * scale),
            fill=(255, 255, 255, 230)
        )
        
        # Bulbo del termometro (cerchio bianco)
        bulb_radius = int(12 * scale)
        bulb_center_y = center_y + int(18 * scale)
        draw.ellipse(
            [center_x - bulb_radius, bulb_center_y - bulb_radius,
             center_x + bulb_radius, bulb_center_y + bulb_radius],
            fill=(255, 255, 255, 230)
        )
        
        # Mercurio rosso (rettangolo interno)
        mercury_width = int(8 * scale)
        mercury_height = int(25 * scale)
        mercury_x1 = center_x - mercury_width // 2
        mercury_y1 = center_y - int(15 * scale)
        mercury_x2 = center_x + mercury_width // 2
        mercury_y2 = center_y + int(10 * scale)
        
        draw.rounded_rectangle(
            [mercury_x1, mercury_y1, mercury_x2, mercury_y2],
            radius=int(4 * scale),
            fill=(239, 68, 68, 255)
        )
        
        # Mercurio rosso nel bulbo (cerchio)
        mercury_bulb_radius = int(8 * scale)
        draw.ellipse(
            [center_x - mercury_bulb_radius, bulb_center_y - mercury_bulb_radius,
             center_x + mercury_bulb_radius, bulb_center_y + mercury_bulb_radius],
            fill=(239, 68, 68, 255)
        )
        
        # Tacche di misurazione
        line_width = int(1.5 * scale)
        tick_x_start = center_x + thermo_width // 2
        tick_x_end = tick_x_start + int(5 * scale)
        
        for tick_y_offset in [-20, -10, 0]:
            tick_y = center_y + int(tick_y_offset * scale)
            draw.line(
                [tick_x_start, tick_y, tick_x_end, tick_y],
                fill=(255, 255, 255, 200),
                width=max(1, line_width)
            )
        
        # Salva l'immagine
        img.save(output_path, 'PNG')
        print(f"✓ Creata icona: {output_path} ({size}x{size})")
    
    # Genera le icone
    print("Generazione icone PWA...")
    create_icon(192, 'public/pwa-192x192.png')
    create_icon(512, 'public/pwa-512x512.png')
    create_icon(180, 'public/apple-touch-icon.png')
    print("\n✓ Tutte le icone sono state generate con successo!")
    print("\nPuoi ora fare il build e il deploy:")
    print("  npm run build")
    print("  firebase deploy")

except ImportError as e:
    print("Errore: Librerie mancanti")
    print("\nInstalla le dipendenze con:")
    print("  pip install pillow")
    print("\nOppure usa un generatore online:")
    print("  https://www.pwabuilder.com/imageGenerator")
    print("  https://favicon.io/favicon-generator/")

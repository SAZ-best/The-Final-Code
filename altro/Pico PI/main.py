import sys
import time
import tkinter as tk

# --- CONFIGURAZIONE EMULATORE PIXEL-PER-PIXEL ---
LARGHEZZA = 128
ALTEZZA = 64
SCALA = 7  # Dimensione del pixel emulato sul monitor del PC

COLORE_SPENTO = "#030A05"  # Sfondo OLED spento (Nero profondo)
COLORE_ACCESO = "#00FF66"  # Pixel OLED acceso (Verde fosforo)

class SSD1306_EmulatorePC:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("OLED SSD1306 Matrice Reale (128x64)")
        self.root.resizable(False, False)
        self.root.configure(bg="#111")
        
        # Canvas che simula la griglia di pixel
        self.canvas = tk.Canvas(
            self.root, 
            width=LARGHEZZA * SCALA, 
            height=ALTEZZA * SCALA, 
            bg=COLORE_SPENTO, 
            highlightthickness=0
        )
        # SISTEMATO QUI: padx e pady al posto di padding
        self.canvas.pack(padx=15, pady=15)
        self.buffer_inversione = False

    def fill(self, valore):
        """0 = Spegne tutto, 1 = Accende tutto lo schermo"""
        self.canvas.delete("pixel_data")
        if valore == 1:
            self.buffer_inversione = True
            self.canvas.create_rectangle(
                0, 0, LARGHEZZA * SCALA, ALTEZZA * SCALA, 
                fill=COLORE_ACCESO, outline="", tags="pixel_data"
            )
        else:
            self.buffer_inversione = False

    def text(self, stringa, x, y, colore_bit=1):
        """Riproduce il font fisso a 8 pixel di MicroPython"""
        colore = COLORE_ACCESO if colore_bit == 1 else COLORE_SPENTO
        if self.buffer_inversione:
            colore = COLORE_SPENTO if colore_bit == 1 else COLORE_ACCESO
            
        self.canvas.create_text(
            x * SCALA, y * SCALA, 
            text=stringa, 
            fill=colore, 
            font=("Consolas", int(SCALA * 1.1), "bold"), 
            anchor="nw", 
            tags="pixel_data"
        )

    def rect(self, x, y, w, h, colore_bit=1):
        """Disegna il contorno di un rettangolo di spessore 1 pixel"""
        colore = COLORE_ACCESO if colore_bit == 1 else COLORE_SPENTO
        if self.buffer_inversione:
            colore = COLORE_SPENTO if colore_bit == 1 else COLORE_ACCESO
            
        self.canvas.create_rectangle(
            x * SCALA, y * SCALA, (x + w) * SCALA, (y + h) * SCALA, 
            outline=colore, width=1, tags="pixel_data"
        )

    def fill_rect(self, x, y, w, h, colore_bit=1):
        """Disegna un rettangolo pieno di pixel"""
        colore = COLORE_ACCESO if colore_bit == 1 else COLORE_SPENTO
        if self.buffer_inversione:
            colore = COLORE_SPENTO if colore_bit == 1 else COLORE_ACCESO
            
        self.canvas.create_rectangle(
            x * SCALA, y * SCALA, (x + w) * SCALA, (y + h) * SCALA, 
            fill=colore, outline="", tags="pixel_data"
        )

    def line(self, x1, y1, x2, y2, colore_bit=1):
        """Disegna una linea da punto a punto"""
        colore = COLORE_ACCESO if colore_bit == 1 else COLORE_SPENTO
        if self.buffer_inversione:
            colore = COLORE_SPENTO if colore_bit == 1 else COLORE_ACCESO
            
        self.canvas.create_line(
            x1 * SCALA, y1 * SCALA, x2 * SCALA, y2 * SCALA, 
            fill=colore, width=1, tags="pixel_data"
        )

    def show(self):
        """Invia i dati allo schermo grafico"""
        self.root.update_idletasks()
        self.root.update()

# Istanziamo il finto schermo OLED
oled = SSD1306_EmulatorePC()

# --- INTERFACCIA GRAFICA HACKER (LOGICA IDENTICA A MICROPYTHON) ---

def visual_boot():
    oled.fill(0)
    lines = [
        ">_ INIT KERNEL",
        "  LOAD: SEC_MOD",
        "  MOUNT: /dev/sda1",
        "  FIREWALL: ON",
        "  SYSTEM: READY"
    ]
    
    y = 2
    for line in lines:
        oled.text(line, 4, y)
        oled.line(0, 0, 0, 64, 1) 
        oled.show()
        time.sleep(0.4)
        y += 12
    time.sleep(0.8)

def visual_loading():
    for p in range(0, 101, 2):
        oled.fill(0)
        
        oled.line(2, 2, 12, 2, 1)
        oled.line(2, 2, 2, 12, 1)
        oled.line(116, 61, 126, 61, 1)
        oled.line(126, 51, 126, 61, 1)
        
        oled.text("ACCESSING SYSTEM", 6, 8)
        oled.rect(10, 26, 108, 10, 1)
        
        larghezza_pixel = int(104 * (p / 100))
        if d_pixel := larghezza_pixel:
            oled.fill_rect(12, 28, d_pixel, 6, 1)
            
        oled.text(f"STAGE: {p}%", 28, 44)
        oled.show()
        time.sleep(0.02)
    time.sleep(0.6)

def visual_launching():
    for frame in range(12):
        oled.fill(0)
        oled.text("LAUNCHING SITE", 10, 6)
        oled.text("CONNECTING PC...", 6, 20)
        oled.rect(8, 34, 112, 24, 1)
        
        scan_y = (frame * 3) % 20 + 36
        oled.line(10, scan_y, 118, scan_y, 1)
        
        oled.show()
        time.sleep(0.15)

def visual_success():
    for _ in range(3):
        oled.fill(1)
        oled.show()
        time.sleep(0.08)
        oled.fill(0)
        oled.show()
        time.sleep(0.08)
        
    oled.fill(0)
    oled.fill_rect(0, 0, 128, 13, 1)
    oled.text("ACCESS GRANTED", 12, 1, 0)
    
    oled.rect(8, 20, 112, 16, 1)
    oled.text("PermissionOS", 18, 24)
    oled.text("STATUS: OPERATIONAL", 4, 44)
    
    for x in range(0, 128, 8):
        oled.fill_rect(x, 58, 4, 2, 1)
        
    oled.show()

# --- AVVIO ESECUZIONE ---
if __name__ == "__main__":
    visual_boot()
    visual_loading()
    visual_launching()
    visual_success()
    
    oled.root.mainloop()
import qrcode

# Enter any link here
url = "https://dental-hygiene.mohamedhassanein65.workers.dev/"

# Generate the QR code
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)

qr.add_data(url)
qr.make(fit=True)

# Create and save the QR code image
img = qr.make_image(fill_color="blue", back_color="white")
img.save("qrcode.png")

print("QR code generated successfully!")
print("Saved as qrcode.png")
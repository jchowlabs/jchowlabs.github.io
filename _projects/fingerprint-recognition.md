---
title: "Fingerprint Recognition System"
excerpt: ""
collection: projects
---

### ![Self-Driving-Car](/images/self-driving-car.png){: .align-center}

### Building Your Own Fingerprint Recognition System with Raspberry Pi

Fingerprint recognition is a widely used biometric authentication method. In this guide, we will walk through the process of building a fingerprint recognition system using a Raspberry Pi, an Adafruit fingerprint reader, and the Adafruit Fingerprint Reader Library.

### Components Needed
* Raspberry Pi (any model with GPIO support)
* Adafruit Optical Fingerprint Sensor
* Jumper wires
* Breadboard (optional)
* Power supply

### Setting Up the Hardware

1. Connect the Fingerprint Sensor to Raspberry Pi

The Adafruit Fingerprint Sensor has four key connections:

* VCC: Connect to 3.3V or 5V on Raspberry Pi
* GND: Connect to Ground (GND) on Raspberry Pi
* TX: Connect to GPIO 14 (UART RX)
* RX: Connect to GPIO 15 (UART TX)

2. Enable UART on Raspberry Pi

Open the terminal and edit the boot configuration:

* sudo raspi-config
* Navigate to Interfacing Options > Serial and disable the login shell over serial but enable the hardware serial port.
* Save and reboot the Raspberry Pi.

3. Installing the Required Libraries

Update the Raspberry Pi

sudo apt update && sudo apt upgrade

Install Python and Pip (if not already installed)

* sudo apt install python3 python3-pip

Install the Adafruit Fingerprint Library

* pip3 install adafruit-circuitpython-fingerprint

### Writing the Code

Create a Python script to interact with the fingerprint sensor:

```python 
import time
import serial
import adafruit_fingerprint

# Set up serial connection
uart = serial.Serial("/dev/serial0", baudrate=57600, timeout=1)
fps = adafruit_fingerprint.Adafruit_Fingerprint(uart)

# Function to enroll a fingerprint
def enroll_fingerprint(location):
    print("Place finger on sensor...")
    while fps.get_image() != adafruit_fingerprint.OK:
        pass
    
    print("Image captured, processing...")
    if fps.image_2_tz(1) != adafruit_fingerprint.OK:
        return False
    
    print("Remove finger and place it again...")
    while fps.get_image() != adafruit_fingerprint.NO_FINGER:
        pass
    while fps.get_image() != adafruit_fingerprint.OK:
        pass
    
    if fps.image_2_tz(2) != adafruit_fingerprint.OK:
        return False
    
    if fps.create_model() != adafruit_fingerprint.OK:
        return False
    
    if fps.store_model(location) != adafruit_fingerprint.OK:
        return False
    
    print(f"Fingerprint stored at position {location}")
    return True

# Function to search for a fingerprint
def search_fingerprint():
    print("Place finger on sensor...")
    while fps.get_image() != adafruit_fingerprint.OK:
        pass
    
    if fps.image_2_tz(1) != adafruit_fingerprint.OK:
        return None
    
    if fps.finger_fast_search() == adafruit_fingerprint.OK:
        print(f"Fingerprint found at position {fps.finger_id}")
        return fps.finger_id
    else:
        print("Fingerprint not recognized.")
        return None

# Example usage
enroll_fingerprint(1)
search_fingerprint()
```

### Running the Program

Save the script as fingerprint.py and run it:

* python3 fingerprint.py

### Conclusion

By following this guide, you can build a functional fingerprint recognition system using a Raspberry Pi and an Adafruit Fingerprint Sensor. This project can be extended for applications like smart door locks, attendance tracking, or secure authentication systems.


